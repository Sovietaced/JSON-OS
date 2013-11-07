/* ------------  
   processControlBlock.js

   Requires global.js.
   
   ------------ */

   function PCB() {

     var Acc = null;
     var Xreg = null;
     var Yreg = null;
     var Zflat = null;
     var pid = null;
     var PC = 0;
     var base = 0;
     var offset = 0;              
     
     
     this.init = function(pid, base, offset){
      this.Acc = null;
      this.Xreg = null;
      this.Yreg = null;
      this.Zflag = null;
      this.pid = pid;
      this.PC = base;
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

    this.captureState = function(){
      this.Acc = _CPU.Acc;
      this.Xreg = _CPU.Xreg;
      this.Yreg = _CPU.Yreg;
      this.Zflag = _CPU.Zflag;
      this.PC = _CPU.PC;
    };

     this.loadState = function(){
      console.log("LOADING FROM PCB WITH PC " + this.PC);
      _CPU.Acc = this.Acc;
      _CPU.Xreg = this.Xreg;
      _CPU.Yreg = this.Yreg;
      _CPU.Zflag = this.Zflag;
      _CPU.PC = this.PC;
    };

    this.kill = function(){
      _memoryManager.clearMemory(this.base, this.offset);
    };

    this.updateDisplay = function(){
      $('#pcb-PID').html(this.pid);
      $('#pcb-PC').html(this.PC);
      $('#pcb-Acc').html(this.Acc);
      $('#pcb-Xreg').html(this.Xreg);
      $('#pcb-Yreg').html(this.Yreg);
      $('#pcb-Zflag').html(this.Zflag);
    };
  }
