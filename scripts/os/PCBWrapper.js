/* ------------  
   processControlBlock.js

   Requires global.js.
   
   ------------ */

  function PCBWrapper() {

  pcb = null;      // PCB
  tsb = null;      // Denotes whether it is swapped to HDD

  this.init = function(pcb,tsb){
      this.pcb = pcb;     
      this.tsb = tsb;
    };

  this.setTSB = function(tsb){
    this.tsb = tsb;
  }
}
