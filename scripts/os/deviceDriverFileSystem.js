/* ----------------------------------
   DeviceDriverFileSystem.js
   
   Requires deviceDriver.js
   
   The Kernel File System Device Driver.
   ---------------------------------- */

DeviceDriverFileSystem.prototype = new DeviceDriver;  // "Inherit" from prototype DeviceDriver in deviceDriver.js.
 //These are special cases that don't fit the ASCII mapping


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
    this.status = "loaded";
    // More?
}

function krnFSDispatchDiskRequest(params)
{
   
}
