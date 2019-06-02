var XLSX = require('xlsx');
const $ = require('cheerio');
const rp = require('request-promise');

/* Replace 'Sites_List' with your CSV file name */
var workbook = XLSX.readFile('Sites_List.csv');
var sheet_name_list = workbook.SheetNames;

/* We keep default values (defval) null in order to not skip rows for any reason if data is missing */
var oldData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {raw: true, defval:null});

/* newData will be our newly updated CSV data we will write to a new file */
var newData = [];
var errors = 0;
var itemsRead = 0;
var foundDesc = 0;
var noDesc = 0;
var requestsPerWait = 80;
var totalItems = oldData.length - 1;
var errorCodes = [];

async function getDescriptions(){
    for(var i = 0; i < totalItems; i++){
        if(i % requestsPerWait == 0) {
            await makeRequest(i);
        } else {
            makeRequest(i);
        }
    }
}

/** i is current index (row) in sheet */
function makeRequest(i) {
	
	/* New Item will be a row for our new file, which is represented by an object */
    /* Each property name represents the column name for the value */
    let newItem = {};
    newItem["Company"] = oldData[i]["Company"];
	
	/* Appending a http header to the urls when necessary for successful calls */
    if(oldData[i]["WebsiteDomain"].substring(0,4) != "http") {
        newItem["WebsiteDomain"] = "http://" + oldData[i]["WebsiteDomain"];
    } else {
        newItem["WebsiteDomain"] = oldData[i]["WebsiteDomain"];
    }
	
	/* We are requesting the document with 'rp' at the url endpoint */
    return rp(newItem["WebsiteDomain"])
		/* If the document is returned successfully this block with be executed */
        /* the 'html' parameter will contain the document, this can be named whatever you please */
        .then(function(html){
			
			/* We use Cheerio (named $) to parse the document to find the meta description tag in the head */
			/* There are many other useful bits of information contained in meta tags you can scrape here */
			/* For my purposes and this example we are seeking the description meta information */
			var description = $('meta[name="description"]', html)['0'];
			var ogDescription = $('meta[name="og:description"]', html)['0'];
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
        .catch(function(err){
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
    var ws = XLSX.utils.json_to_sheet(newData);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Description_List");
    XLSX.writeFile(wb, "Description_List.csv");
    process.exit();
}

/* Sometimes itemsRead never reaches totalItems (usually by a difference of just a few) */
/* This gives us the ability to Ctrl+C escape the program and write what we got successfully */
process.on('SIGINT', function() {
    writeToFile();
});

getDescriptions();