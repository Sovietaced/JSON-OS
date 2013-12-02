/* ----------------------------------
   DeviceDriverFileSystem.js
   
   Requires deviceDriver.js
   
   The Kernel File System Device Driver.
   ---------------------------------- */

DeviceDriverFileSystem.prototype = new DeviceDriver;  // "Inherit" from prototype DeviceDriver in deviceDriver.js.

var disk = null;
var directory = null;

// Constants
var NUM_TRACKS = 4;
var NUM_SECTORS = 8;
var NUM_BLOCKS = 8;

var BLOCK_SIZE = 64;
var BLOCK_DATA_SIZE = 60;

var TRACKS = {
     DIRECTORY_DATA : 0,
     FILE_DATA : [1,2,3]
}

var BLOCKS = {
    ACTIVITY_INDEX : 0,
    TRACK_INDEX : 1,
    SECTOR_INDEX : 2,
    BLOCK_INDEX : 3,
    DATA_INDEX : [4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,
    36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63]
}

var MBR_TSB = "000";
var DIRECTORY_TSB = "001";

function DeviceDriverFileSystem()                     // Add or override specific attributes and method pointers.
{
    // "subclass"-specific attributes.
    // this.buffer = "";    // TODO: Do we need this?
    // Override the base method pointers.
    this.driverEntry = krnFSDriverEntry;
    this.isr = krnFSDispatchDiskRequest;
    // "Constructor" code.
}

function krnFSDriverEntry()
{
    // Initialization routine for this, the kernel-mode File System Device Driver.
    disk = _HDD;                                // Assign Hardawre to driver
    krnFSFormat();                              // Format the disk
    this.status = "loaded";
}

// For getting a TSB string
function generateTSB(t,s,b)
{   
    // Convert values to string and concatenate
   return t.toString() + s.toString() + b.toString();
}

// Increments the TSB value, self explanatory
function incrementTSB(tsb)
{   
    var values = tsb.split("");

    if (parseInt(values[2]) < 7){
        values[2] = (parseInt(values[2]) + 1) + '';
    }
    else {
        values[2] = "0";
        if (parseInt(values[1]) < 7){
            values[1] = (parseInt(values[1]) + 1) + '';
        }
        else{
            values[1] = "0";
            if (parseInt(values[0]) < 3){
                values[0] = (parseInt(values[0]) + 1) + '';
            }
            else{
                return null;
            }
        }
    }
    values = values.join("");
    return values;
}

// Generates block data in hex
function generateDiskData(activity, tsb, data) 
{   
    // Fill buffer with dashes, we write entire blocks at a time because the HDD is a hash
    var buffer = 61 - data.length;
    data = data + Array(buffer).join("-");

    // Convert values to strings, map get ASCII calues to hex strings
    return (activity.toString() + tsb + data.toString()).split ('').map (function (c) { return c.charCodeAt(0).toString(16); })
}

function decodeDiskData(dataa)
{   
    // Convert data to hex byte array
    dataa = dataa.split(',')

    // Convert from Hex to String value
    for (var key in dataa){
        dataa[key] = String.fromCharCode(hexToInt(dataa[key]));
    }    

    // Gather values
    var activity = dataa[BLOCKS.ACTIVITY_INDEX];
    var track = dataa[BLOCKS.TRACK_INDEX];
    var block = dataa[BLOCKS.BLOCK_INDEX];
    var sector = dataa[BLOCKS.SECTOR_INDEX];
    var data = '';
    for (var index = 0; index < BLOCKS.DATA_INDEX.length; index++){
        data += dataa[BLOCKS.DATA_INDEX[index]];
    }    

    // return hash of values
    return { 'activity' : activity,
            'track' : track, 
            'block' : block,
            'sector': sector,
            'data' : data}
}

function krnFSDispatchDiskRequest(params)
{
   
}

function krnFSFormat()
{   
    // Format the disk
    for (var t =0; t < NUM_TRACKS; t++){
        for (var s = 0; s < NUM_SECTORS; s++){
            for (var b = 0; b < NUM_BLOCKS; b++){

                // Generate TSB for cuntion and generate data
                var tsb = generateTSB(t,s,b);
                var data = generateDiskData(0, generateTSB('-', '-', '-'), "");

                // Generate MBR code
                if (tsb === MBR_TSB){
                    data = generateDiskData(1, generateTSB('-', '-', '-'), "MBR");
                }

                // Write data to disk
                disk.write(tsb,data);
            }
        }
    }
}

function krnListFiles()
{
    var files = '';
    var t = TRACKS.DIRECTORY_DATA;

    for (var s = 0; s < NUM_SECTORS; s++){
        for (var b = 0; b < NUM_BLOCKS; b++){

            // Generate TSB for function
            var tsb = generateTSB(t,s,b);
            var data = disk.read(tsb);

            // Get value hash
            data = decodeDiskData(data);
            console.log(data);

            // Check for active
            if (data['activity'] == '1'){
                // Get value by shaving off null characters (dashes)
                var value = data['data'].toString();
                value = value.slice(0, value.indexOf("-"));

                console.log(value);

                if (value != ''){
                    files += value + ' '
                }
            }
        }
    }
    return files;
}

// create <name> <data>
function krnCreateFile(name, data)
{   console.log("dataaaa");
    console.log(data);
    if (findFile(name)){
        return "Failed to create file. File already exists."
    }
    // Directory data must fit on one block!
    if (name.length > 60){
        return "Failed to create file. File name must be less than 60 characters";
    }

    var freeFileBlocks = findFreeFileBlocks(data);

    if (!freeFileBlocks){
        return "Failed to create file. Ran out of free file space";
    }

    var freeDirectoryBlock = findFreeDirectoryBlock();

    if (!freeDirectoryBlock){
        return "Failed to create file. Ran out of free directory space";
    }

    var firstFreeFileBlock = freeFileBlocks[0];

    krnWriteFileDirectory(freeDirectoryBlock, firstFreeFileBlock, name);
    krnWriteFileData(freeFileBlocks, data);

    // Notify successful
    return true;
}

function krnReadFile(fileName)
{   
    // Get directory location of file
    var tsb = findFile(fileName);

    if (tsb) {

        // Holds value of file over multiple blocks
        var value = '';

        // Get location of actual file from directory values
        tsb = getFileTSB(tsb);

        do{
            var data = disk.read(tsb);
            data = decodeDiskData(data);

            var blockValue = data['data'].toString();

            var end = blockValue.indexOf("-");
            if (end != -1){
                value += blockValue.slice(0, blockValue.indexOf("-"));
            }
            else{
                value += blockValue;
            }   

            // Get location of next block in chain
            tsb = getNextTSB(data);

        }while(tsb != '---');

        return value;
    }
}

function krnWriteFile(fileName, data)
{
    var tsb = findFile(fileName);

    if (tsb){
        // Get actual file TSB
        var tsb = getFileTSB(tsb);

        if (data.length > BLOCK_DATA_SIZE){

            // Get the overflow size, we only care about the length
            var remainder = data.substring(0, data.length - BLOCK_DATA_SIZE);

            // Get the blocks needed for the data
            var freeFileBlocks = findFreeFileBlocks(remainder);

            if (!freeFileBlocks){
                return "Failed to write file. Ran out of free file space";
            }
            // Append the existing block for the file to the front so we reuse the existing block
            freeFileBlocks.unshift(tsb);
        }
        else{

            var freeFileBlocks = [tsb];
            console.log(freeFileBlocks);
        }

        krnWriteFileData(freeFileBlocks, data);

        return true;        
    }
    else{
        return "File not found";
    }
}

// delete <name>
function krnDeleteFile(fileName)
{

    var tsb = findFile(fileName);

    if (tsb){
        krnRemoveFileData(tsb);
        krnRemoveFileDirectory(tsb);
    }

    // Remove from directory stack

}

function findFile(fileName)
{
    var t = TRACKS.DIRECTORY_DATA

    for (var s = 0; s < NUM_SECTORS; s++){
        for (var b = 0; b < NUM_BLOCKS; b++){

            // Generate TSB for function
            var tsb = generateTSB(t,s,b);
            var data = disk.read(tsb);

            // Get value hash
            data = decodeDiskData(data);

            // Check for non active
            if (data['activity'] == '1'){
                // Get value by shaving off null characters (dashes)
                var value = data['data'].toString();
                value = value.slice(0, value.indexOf("-"));

                if (value == fileName){
                    return tsb;
                }
            }
        }
    }
}

function krnWriteFileData(blocks, data)
{      
    // This splits the data into an array of strings, each string with a max size of 60. regex magic...
    var dataBlocks = data.match(/.{1,60}/g);

     // Make sure we handle empty files
    if(data == ''){
        dataBlocks = [''];    
    }

    for (var i = 0; i < dataBlocks.length; i++){
        
        // As long as we are not at the end of the data, we need to write linking TSB (next block)
        if (i+1 < dataBlocks.length){
            var data = generateDiskData(1, blocks[i+1], dataBlocks[i]);
        }
        // Must have hit the end of the file, no chaining here 
        else{
            var data = generateDiskData(1, generateTSB('-', '-', '-'), dataBlocks[i]);
        }
        // Write data to block
        disk.write(blocks[i], data);
    }
}

// used for deleting files
function krnRemoveFileData(tsb)
{   
    do {
        // Grab the data before we overwrite it
        var oldData = disk.read(tsb);

        // active | TSB of file | file name
        var cleanData = generateDiskData(0, generateTSB('-', '-', '-'), '');

        // Write file to file TSB
        disk.write(tsb, cleanData);

        // Set the TSB to the TSB described by the chain
        oldData = decodeDiskData(oldData);
        tsb = getNextTSB(oldData);

    } while(tsb != '---');
}

function krnWriteFileDirectory(directoryTSB, fileTSB, name)
{
    // active | TSB of file | file name
    var data = generateDiskData(1, fileTSB, name);

    // Write data about file in directory TSB
    disk.write(directoryTSB, data);
}

function krnRemoveFileDirectory(directoryTSB)
{
    // active | TSB of file | file name
    var data = generateDiskData(0, generateTSB('-', '-', '-'), '');

    // Write data about file in directory TSB
    disk.write(directoryTSB, data);
}

function findFreeFileBlocks(fileData)
{   
    // Get the number of blocks needed and round up
    var numBlocks = Math.ceil(fileData.length / BLOCK_DATA_SIZE);

    // Make sure we handle empty files
    if(fileData == ''){
        numBlocks = 1;
    }

    var blocks = [];

    for (var t = 0; t < TRACKS.FILE_DATA.length; t++){
        var track = TRACKS.FILE_DATA[t];
        for (var s = 0; s < NUM_SECTORS; s++){
            for (var b = 0; b < NUM_BLOCKS; b++){

                // Generate TSB for function
                var tsb = generateTSB(track,s,b);
                var data = disk.read(tsb);

                // Get value hash
                data = decodeDiskData(data);

                // Check for non active
                if (data['activity'] == '0'){
                    blocks.push(tsb);
                }
            }
        }
    }
    // Check to see if we've found enough free blocks
    if (blocks.length > numBlocks){
        // Return only the amount of blocks needed
        return blocks.slice(0,numBlocks);
    }
}
    
function findFreeDirectoryBlock()
{

    var t = TRACKS.DIRECTORY_DATA

    for (var s = 0; s < NUM_SECTORS; s++){
        for (var b = 0; b < NUM_BLOCKS; b++){

            // Generate TSB for function
            var tsb = generateTSB(t,s,b);
            var data = disk.read(tsb);

            // Get value hash
            data = decodeDiskData(data);

            // Check for non active
            if (data['activity'] == '0'){
                return tsb;
            }
        }
    }
}

function getNextTSB(data)
{
    return generateTSB(data['track'], data['sector'], data['block']);
}

function getFileTSB(tsb)
{
    var data = disk.read(tsb);
    data = decodeDiskData(data);
    tsb = getNextTSB(data);

    return tsb;
}