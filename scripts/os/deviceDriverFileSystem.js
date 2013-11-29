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

var TRACKS = {
     DIRECTORY_DATA : [0],
     FILE_DATA : [1,2,3]
}

var BLOCKS = {
    ACTIVITY_INDEX : [0],
    TRACK_INDEX : [1],
    SECTOR_INDEX : [2],
    BLOCK_INDEX : [3],
    DATA_INDEX : [4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,
    36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63]
}

var MBR_TSB = "000"

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

    disk.debug();
    // More?
}

// For getting a TSB string
function generateTSB(t,s,b)
{   
    // Convert values to string and concatenate
   return t.toString() + s.toString() + b.toString();
}

// Generates block data in hex
function generateDiskData(activity, t, s, b, data) 
{   
    var TSB = generateTSB(t,s,b);
    if (data == ''){ 
        data = Array(61).join("0")
    }

    console.log(data);
    // Convert values to strings, map get ASCII calues to hex strings
    return (activity.toString() + TSB + data.toString()).split ('').map (function (c) { return c.charCodeAt(0).toString(16); })
}

function krnFSDispatchDiskRequest(params)
{
   
}

function krnFSFormat()
{   
    // Format the directory
    directory = {}

    // Format the disk
    for (var t =0; t < NUM_TRACKS; t++){
        for (var s = 0; s < NUM_SECTORS; s++){
            for (var b = 0; b < NUM_BLOCKS; b++){

                var tsb = generateTSB(t,s,b);
                var data = generateDiskData(0, '-', '-', '-', "");

                // Write MBR to MBR tsb
                if (tsb === MBR_TSB){
                    data = generateDiskData(1, '-', '-', '-', "MBR");
                }

                disk.write(tsb,data);
            }
        }
    }
}

// create <name> <data>
function krnCreateFile(name, data)
{

    var freeBlock = findFreeBlock();

}

function findFreeBlock()
{
    for (track in TRACKS.DIRECTORY_DATA){
         for (var s = 0; s < NUM_SECTORS; s++){
            for (var b = 0; b < NUM_BLOCKS; b++){

                var tsb = generateTSB(track,s,b);
                var data = disk.read(tsb);


            }
        }
    }
}