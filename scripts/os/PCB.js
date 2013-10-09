/* ------------  
   processControlBlock.js

   Requires global.js.
   
   ------------ */

function PCB() {

	var Acc = null;
	var Xreg = null;
	var Yreg = null;
    var pid = null;
    var PC = 0;
	var base = 0;
	var offset = 0;              
    
    
    this.init = function(pid, offset){
		this.Acc = null;
		this.Xreg = null;
		this.Yreg = null;
	    this.pid = pid;
	    this.PC = 0;
		this.base = 0;
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
}
