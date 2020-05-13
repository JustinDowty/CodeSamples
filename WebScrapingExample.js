const XLSX = require('xlsx');
const $ = require('cheerio');
const rp = require('request-promise');

/* Replace 'File' with your CSV file name */
const workbook = XLSX.readFile('File.csv');
const sheet_name_list = workbook.SheetNames;

/* We keep default values (defval) null in order to not skip rows for any reason if data is missing */
const oldData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {raw: true, defval:null});

/* newData will be our newly updated CSV data we will write to a new file */
const newData = [];
let errors = 0;
let itemsRead = 0;
let foundDesc = 0;
let noDesc = 0;
const requestsPerWait = 30;
const totalItems = oldData.length - 1;
const errorCodes = [];

async function getDescriptions(){

    /* p will be reassigned to each promise and pushed to promises to be */
    /* awaited every so often to avoid to many async calls at the same time */
    let p;
    let promises = [];
    for(let i = 0; i < totalItems; i++){

        /* New Item will be a row for our new file, which is represented by an object */
        /* Each property name represents the column name for the value */
        let newItem = {};
        newItem.Id = oldData[i].Id;

        /* If no website URL, nothing to check */
        if(!oldData[i].WebsiteURL) {
            continue;
        }
        
        /* Appending a http header to the urls when necessary for successful calls */
        if(oldData[i].WebsiteURL.substring(0,5) == "https") {
            newItem.WebsiteURL = "http" + oldData[i].WebsiteURL.substring(4);
        } else if(oldData[i].WebsiteURL.substring(0,4) != "http") {
            newItem.WebsiteURL = "http://" + oldData[i].WebsiteURL;
        } else {
            newItem.WebsiteURL = oldData[i].WebsiteURL;
        }

        /* We are requesting the document with 'rp' at the url endpoint */
        /* We are also holding on to this promise with variable p to be awaited later */
        p = rp(newItem.WebsiteURL)

        /* If the document is returned successfully this block with be executed */
        /* the 'html' parameter will contain the document, this can be named whatever you please */
        .then(html => {

            /* We use Cheerio (named $) to parse the document to find the meta description tag in the head */
            /* There are many other useful bits of information contained in meta tags you can scrape here */
            /* For my purposes and this example we are seeking the description meta information */
            let description = $('meta[name="description"]', html)[0];
            let ogDescription = $('meta[name="og:description"]', html)[0];
            if(description){
                foundDesc++;
                newItem["Description"] = description.attribs.content;
                newData.push(newItem);
                
            /* Some sites use meta description tags with 'og:' at the beginning */
            /* In case there is one but not the other, we will look for that as well */
            } else if(ogDescription){
                foundDesc++;
                newItem["Description"] = ogDescription.attribs.content;
                newData.push(newItem);
            } else {
                noDesc++;
            }
            
            /* Print out every 500 items read for reference */
            itemsRead++;            
            if(itemsRead % 500 == 0){
                console.log("****************");
                console.log("Items Read: " + itemsRead);
                console.log("****************");
            }
            
            /** Program finishes when the last request is processed */
            if(itemsRead == totalItems - 1){
                writeToFile();
                return;
            }
        })
        .catch(err => {
            errors++;
            console.log(err.message.substring(0, 101));
            
            /* Keeping count of error codes in an array of objects */
            if(!errorCodes.some(el => el.code == err.message.substring(0, 3))){
                errorCodes.push({code: err.message.substring(0, 3), count: 1});
            } else {
                errorCodes.filter(el => el.code == err.message.substring(0, 3))[0].count++;
            }

            itemsRead++;            
            if(itemsRead % 500 == 0){
                console.log("****************");
                console.log("Items Read: " + itemsRead);
                console.log("****************");
            }
            if(itemsRead == totalItems - 1){
                writeToFile();
                return;
            }
        });

        /* Here we app the promise p to the promises array */
        promises.push(p);

        if((i + 1) % requestsPerWait == 0) {

            /* After making a certain number of promises we will make sure all */
            /* have returned before firing off more */
            await Promise.all(promises);
            
            /* We must reset the promises array for the next set */
            promises = [];
        }
    }
}

function writeToFile(){
    console.log("HTTP Request Errors: " + errors);
    console.log("Found Descriptions: " + foundDesc);
    console.log("No Description Found: " + noDesc);
    console.log("Total Items Read: " + itemsRead, "Total Items: " + totalItems);
    console.log("Error Rate: " + (errors / itemsRead).toFixed(3));
    console.log("Total Failure Rate (Errors and No Description Found): " + ((errors + noDesc) / itemsRead).toFixed(3));
    console.log("Error codes:");
    console.log(errorCodes);
	
	/* Here we write our new data to a new file */
    const ws = XLSX.utils.json_to_sheet(newData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "NewData");
    XLSX.writeFile(wb, "NewFile.csv");
    process.exit();
}

/* This gives us the ability to Ctrl+C escape the program and write what we got successfully */
process.on('SIGINT', function() {
    writeToFile();
});

/* Launches our program */
getDescriptions();