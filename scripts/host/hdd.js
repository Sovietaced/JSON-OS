/* ------------  
   hdd.js

   Requires global.js.
   
   ------------ */

function Hdd() {

    this.init = function() {
      
    };

    this.write = function(tsb, value) {
      localStorage[tsb] = value;
    };

    this.read = function(tsb) {
      return localStorage[tsb];
    };
}
