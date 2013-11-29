/* ----------------------------------
   DeviceDriverFileSystem.js
   
   Requires deviceDriver.js
   
   The Kernel File System Device Driver.
   ---------------------------------- */

DeviceDriverFileSystem.prototype = new DeviceDriver;  // "Inherit" from prototype DeviceDriver in deviceDriver.js.

var disk = null;

var directory = null;

// Constants
var TRACK_SIZE = 4;
var SECTOR_SIZE = 8;
var BLOCK_SIZE = 8;

var TRACKS = {
     DIRECTORY_DATA : [0],
     FILE_DATA : [1,2,3]
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
    // More?
}

function krnFSDispatchDiskRequest(params)
{
   
}

function krnFSFormat()
{
    directory = {}                               // Instantiate clean direcotry data
}
