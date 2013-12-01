/* ------------  
   cpuScheduler.js

   Requires global.js.
   
   ------------ */

function CpuScheduler() {

  this.quantum = 6;     // Quantum value in clock ticks
  this.clock = 0;
  this.readyQueue = new Queue();
  this.mode = null;
  this.SCHEDULING_ALGORITHMS = ['RR', 'FCFS', 'PRIORITY'];
  this.currentAlgorithm = 'RR';       // Default to round robin

    this.init = function(){
      this.quantum = 6;     // Quantum value in clock ticks
      this.clock = 0;       // Clock ticks to evaluate when switching is necessary
      this.readyQueue = new Queue();
      this.mode = 1;        // user mode
    };

    // Returns the head of the PCB
    this.getRunningProcess = function(){
      return this.readyQueue.peek();
    };

    // Loads the state of the head PCB after switching
    this.loadProcess = function(){
      if(this.readyQueue.getSize() > 0){
        this.readyQueue.peek().loadState();
      }
    };

    this.schedule = function(pcb){

      this.readyQueue.enqueue(pcb);

      // If this is the first process set it up so it can begin executing
      if(this.readyQueue.getSize() === 1){
        this.loadProcess();
        _CPU.isExecuting = true;
      }

      krnTrace("Process " + pcb.getPid() + " scheduled.");
    };

    this.run = function(){
        if (this.readyQueue.getSize() > 0){

          // Determine the current scheduling algorithm and let it handle the scheduling
          switch (this.currentAlgorithm)
          {
            case 'RR':
              this.RR();
              break;
            case 'FCFS':
              this.FCFS();
              break;
            case 'PRIORITY':
              this.PRIORITY();
              break;
          }
        }
        else{
          krnTrace("Scheduler has nothing to schedule. Stopping Execution");
          // We have nothing left to process
          // Back to kernel mode
          this.mode = 0;
         _CPU.isExecuting = false;
        }
    };

    // Round robin, switch every n clock ticks (quantum)
    this.RR = function(){

      console.log("yay");
      if(++this.clock % this.quantum === 0 && this.readyQueue.getSize() > 1){
        _KernelInterruptQueue.enqueue(new Interrupt(SCHEDULER_IRQ, new Array("switch"))); 
      }
      else{
        // Capture state for live updates for every clock tick
        this.readyQueue.peek().captureState();
      }
    };

    // First come first serve, essentially do nothing
    this.FCFS = function(){
      // Capture state for live updates for every clock tick
      this.readyQueue.peek().captureState();
    };

    this.PRIORITY = function(){
      console.log("Priority");
    };

    // Load next in round robin 
    this.rotate = function(){

      // Remove the head
      var pcb = this.readyQueue.dequeue();

      // Capture the CPU state
      pcb.captureState();

      // Add the head to the tail
      this.readyQueue.enqueue(pcb);

      // Load state of new head
      this.loadProcess();

      krnTrace("Scheduler has switched from rocess " + pcb.getPid() + " to process " + this.readyQueue.peek().getPid() + ".");

    };

    this.kill = function() {
      
      // Remove the head
      var process = this.readyQueue.dequeue();
      krnTrace("Scheduler has killed process " + process.getPid());

      // Try to load the newhead
      this.loadProcess();

    };

    this.setQuantum = function(quantum){
      this.quantum = quantum;
    };

    this.updateDisplay = function(){


      var pcbData = [];
      for(var i = 0; i < this.readyQueue.getSize(); i++){
        pcbData.push(this.readyQueue.q[i].toArray());
      }

       // Remove table body rows
      $("#readyQueue").empty(); 

      // Rende heading row
      data = "<td>PID</td><td>PC</td><td>Base</td><td>Offset</td><td>Acc</td><td>XReg</td><td>YReg</td><td>ZFlag</td>"
      $('#readyQueue').append('<tr>' + data + '</tr>');

      // Render HTML and push it
      for (var row in pcbData) {
        var data = "";
         for (var value in pcbData[row]){
            data += "<td> " + pcbData[row][value] + "</td>";
         }
         $('#readyQueue').append('<tr>' + data + '</tr>');
      }

    };

}
