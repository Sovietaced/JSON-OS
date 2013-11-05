/* ------------  
   cpuScheduler.js

   Requires global.js.
   
   ------------ */

function CpuScheduler() {

  this.quantum = 6;     // Quantum value in clock ticks
  this.clock = 0;
  this.readyQueue = new Queue();

    this.init = function(){
      this.quantum = 6;     // Quantum value in clock ticks
      this.clock = 0;
      this.readyQueue = new Queue();
    };

    this.schedule = function(pcb){
      this.readyQueue.enqueue(pcb);
    };

    this.run = function(){

      if(this.clock % this.quantum === 0){
        console.log("wut");
      }
      this.clock++;
    };

    this.rotate = function(){
      var pcb = this.readyQueue.dequeue();

      //if _CPU.PC === pcb.get
    };

    this.updateDisplay = function(){

    };
}
