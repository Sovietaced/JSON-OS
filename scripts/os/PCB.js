/* ------------  
   processControlBlock.js

   Requires global.js.
   
   ------------ */

   function PCB() {

     var Acc = 0;
     var Xreg = 0;
     var Yreg = 0;
     var Zflag = 0;
     var pid = null;
     var PC = 0;
     var base = 0;
     var offset = 0;              
     
     this.init = function(pid){
      this.Acc = 0;
      this.Xreg = 0;
      this.Yreg = 0;
      this.Zflag = 0;
      this.pid = pid;
      this.PC = 0;
      this.base = null;
      this.offset = null;  
    };

    this.setMemoryBounds = function(base, offset){
      this.base = base;
      this.offset = offset; 
    };

    this.getPid = function(){
    	return this.pid;
    };

    this.getBase = function(){
    	return this.base;
    };

    this.getOffset = function(){
    	return this.offset;
    };

    this.getAbsolutePC = function(){
      return this.base + this.PC;
    };

    this.captureState = function(){
      this.Acc = _CPU.Acc;
      this.Xreg = _CPU.Xreg;
      this.Yreg = _CPU.Yreg;
      this.Zflag = _CPU.Zflag;
      this.PC = _CPU.PC - this.base;    // Capture relative PC
    };

     this.loadState = function(){
      _CPU.Acc = this.Acc;
      _CPU.Xreg = this.Xreg;
      _CPU.Yreg = this.Yreg;
      _CPU.Zflag = this.Zflag;
      _CPU.PC = this.getAbsolutePC();
    };

    this.kill = function(){
      _memoryManager.clearPartition(this.pid);
    };

    this.updateDisplay = function(){
      $('#pcb-PID').html(this.pid);
      $('#pcb-PC').html(this.PC);
      $('#pcb-Acc').html(this.Acc);
      $('#pcb-Xreg').html(this.Xreg);
      $('#pcb-Yreg').html(this.Yreg);
      $('#pcb-Zflag').html(this.Zflag);
    };

    this.toArray = function(){
      return new Array(this.pid, this.getAbsolutePC(), this.base, this.offset, this.Acc, this.Xreg, this.Yreg, this.Zflag);
    };
  }
