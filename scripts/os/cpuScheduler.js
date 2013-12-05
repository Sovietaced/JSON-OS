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
      this.mode = 1;        // user thmode
    };

    // Returns the head of the PCB
    this.getRunningProcess = function(){
      var pcbw = this.readyQueue.peek();
      if (pcbw){
        return pcbw;
      }
    };

    // This updates the ready queue when the memory manager changes the state of the process wrappers
    this.updateReadyQueue = function(pcbws){
      for(var i = 0; i < this.readyQueue.getSize(); i++){
        for (var j = 0; j < pcbws.length; j++){
          if(pcbws[j].pcb.getPid() == this.readyQueue.q[i].pcb.getPid()){
            this.readyQueue.q[i] = pcbws[j];
          }
        }
      }
    };

    // Loads the state of the head PCB after switching
    this.loadProcess = function(){
      if(this.readyQueue.getSize() > 0){
        var pcbw = this.getRunningProcess();
        // If we're loading a process in virtual memory swap!        
        if(pcbw.tsb){
          // Swap 
          var updatedPCBWs = _memoryManager.swap(pcbw);
          // Update our copy of the process wrappers with the updated ones
          this.updateReadyQueue(updatedPCBWs);
        }

                // We should be able to load the state, confident that it has been loaded to memory
        pcbw = this.getRunningProcess();
        pcbw.pcb.loadState();
      }
    };

    this.schedule = function(pcbw){

      this.readyQueue.enqueue(pcbw);

      // If this is the first process set it up so it can begin executing
      if(this.readyQueue.getSize() === 1){
        this.loadProcess();
        _CPU.isExecuting = true;
      }

      krnTrace("Process " + pcbw.pcb.getPid() + " scheduled.");
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
      if(++this.clock % this.quantum === 0 && this.readyQueue.getSize() > 1){
        _KernelInterruptQueue.enqueue(new Interrupt(SCHEDULER_IRQ, new Array("switch"))); 
      }
      else{
        // Capture state for live updates for every clock tick
        this.getRunningProcess().pcb.captureState();
      }
    };

    // First come first serve, essentially do nothing
    this.FCFS = function(){
      // Capture state for live updates for every clock tick
      this.getRunningProcess().pcb.captureState();
    };

    this.PRIORITY = function(){
      console.log("Priority");
    };

    // Load next in round robin 
    this.rotate = function(){

      // Remove the head
      var pcbw = this.readyQueue.dequeue();

      // Capture the CPU state
      pcbw.pcb.captureState();

      // Add the head to the tail
      this.readyQueue.enqueue(pcbw);

      // Load state of new head
      this.loadProcess();

      console.log("swapped to : " + this.getRunningProcess().pcb.getPid());

      krnTrace("Scheduler has switched from process " + pcbw.pcb.getPid() + " to process " + this.getRunningProcess().pcb.getPid() + ".");

    };

    this.kill = function(pcbw) {
      
      // Save the current head state in case we are killing a different pcbw
      var head = this.getRunningProcess();
      // Capture the CPU state
      head.pcb.captureState();
      // Add the head to the head
      this.updateReadyQueue(new Array(head));

      // Remove the head
      this.readyQueue.remove(pcbw);
      krnTrace("Scheduler has killed process " + pcbw.pcb.getPid());

      // Try to load the newhead
      this.loadProcess();

      console.log("killed to : " + this.getRunningProcess().pcb.getPid());
    };

    this.setQuantum = function(quantum){
      this.quantum = quantum;
    };

    this.updateDisplay = function(){


      var pcbData = [];
      for(var i = 0; i < this.readyQueue.getSize(); i++){
        var pcbw = this.readyQueue.q[i];
        var tsb = this.readyQueue.q[i].tsb;
        var pcb = this.readyQueue.q[i].pcb.toArray();
        pcb.unshift(tsb);
        pcbData.push(pcb);
      }

       // Remove table body rows
      $("#readyQueue").empty(); 

      // Rende heading row
      data = "<td>TSB</td><td>PID</td><td>PC</td><td>Base</td><td>Offset</td><td>Acc</td><td>XReg</td><td>YReg</td><td>ZFlag</td>"
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

