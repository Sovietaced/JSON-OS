/* ------------  
   hdd.js

   Requires global.js.
   
   ------------ */

function Hdd() {
    this.disk = null; 

    this.init = function() {
      // Check for web storage support
     if(typeof(Storage)!=="undefined"){
          this.disk = localStorage;
        }
    };

    this.writeDisk = function(tsb, value) {
      this.disk[tsb] = value;
    };

    this.readDisk = function(key) {
      return this.disk[tsb];
    };
}
