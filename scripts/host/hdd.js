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

    this.write = function(tsb, value) {
      this.disk[tsb] = value;
    };

    this.read = function(key) {
      return this.disk[tsb];
    };

    this.debug = function() {
      for (tsb in this.disk){
        console.log(this.disk[tsb]);
      }
    }
}
