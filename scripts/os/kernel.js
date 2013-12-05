/* ------------
   Kernel.js
   
   Requires globals.js
   
   Routines for the Operating System, NOT the host.
   
   This code references page numbers in the text book: 
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */


//
// OS Startup and Shutdown Routines   
//
function krnBootstrap()      // Page 8.
{
   hostLog("bootstrap", "host");  // Use hostLog because we ALWAYS want this, even if _Trace is off.

   // Initialize our global queues.
   _KernelInterruptQueue = new Queue();  // A (currently) non-priority queue for interrupt requests (IRQs).
   _KernelBuffers = new Array();         // Buffers... for the kernel.
   _KernelInputQueue = new Queue();      // Where device input lands before being processed out somewhere.
   _Console = new CLIconsole();          // The command line interface / console I/O device.
   // Initialize the CLIconsole.
   _Console.init();

   // Initialize standard input and output to the _Console.
   _StdIn  = _Console;
   _StdOut = _Console;

   // Load the Keyboard Device Driver
   krnTrace("Loading the keyboard device driver.");
   krnKeyboardDriver = new DeviceDriverKeyboard();     // Construct it.  TODO: Should that have a _global-style name?
   krnKeyboardDriver.driverEntry();                    // Call the driverEntry() initialization routine.
   krnTrace(krnKeyboardDriver.status);

   // Load the File System Device Driver
   krnTrace("Loading the file system device driver.");
   krnFSDriver = new DeviceDriverFileSystem();     // Construct it.  TODO: Should that have a _global-style name?
   krnFSDriver.driverEntry();                    // Call the driverEntry() initialization routine.
   krnTrace(krnFSDriver.status);

   // Process related stoof
   _Processes = {};            // Resident List
   _CpuScheduler = new CpuScheduler();
   _CpuScheduler.init();
   _nextPID = 0;                        // Counter for delegating PIDs

   // Memory related stoof
   _memoryManager = new MemoryManager(); 
   _memoryManager.init();

   // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
   krnTrace("Enabling the interrupts.");
   krnEnableInterrupts();

   // Launch the shell.
   krnTrace("Creating and Launching the shell.");
   _OsShell = new Shell();
   _OsShell.init();

     // initialize displays
     _memoryManager.updateDisplay();
     _CPU.updateDisplay();

   // Finally, initiate testing.
   if (_GLaDOS) {
      _GLaDOS.afterStartup();
   }
}

function krnShutdown()
{
    krnTrace("begin shutdown OS");
    // TODO: Check for running processes.  Alert if there are some, alert and stop.  Else...    
    // ... Disable the Interrupts.
    krnTrace("Disabling the interrupts.");
    krnDisableInterrupts();
    // 
    // Unload the Device Drivers?
    // More?
    //
    krnTrace("end shutdown OS");
}


function krnOnCPUClockPulse() 
{
    /* This gets called from the host hardware sim every time there is a hardware clock pulse.
       This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
       This, on the other hand, is the clock pulse from the hardware (or host) that tells the kernel 
       that it has to look for interrupts and process them if it finds any.                           */

    // Check for an interrupt, are any. Page 560
    if (_KernelInterruptQueue.getSize() > 0)    
    {
        // Process the first interrupt on the interrupt queue.
        // TODO: Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
        var interrupt = _KernelInterruptQueue.dequeue();
        krnInterruptHandler(interrupt.irq, interrupt.params);
    }
    else if (_CPU.isExecuting) // If there are no interrupts then run one CPU cycle if there is anything being processed.
    {   
        _CpuScheduler.run();
        _CPU.cycle();

        _CpuScheduler.updateDisplay();
        _memoryManager.updateDisplay();
        _CPU.updateDisplay();
        updateFileSystemDisplay();
    }     
    else                     // If there are no interrupts and there is nothing being executed then just be idle.
    {
       krnTrace("Idle");
      //console.log(JSON.stringify(_Processes));
    }
}


// 
// Interrupt Handling
// 
function krnEnableInterrupts()
{
    // Keyboard
    hostEnableKeyboardInterrupt();
    // Put more here.
}

function krnDisableInterrupts()
{
    // Keyboard
    hostDisableKeyboardInterrupt();
    // Put more here.
}

function krnInterruptHandler(irq, params)    // This is the Interrupt Handler Routine.  Pages 8 and 560.
{
    // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on.  Page 766.
    krnTrace("Handling IRQ~" + irq);

    // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
    // TODO: Consider using an Interrupt Vector in the future.
    // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.  
    //       Maybe the hardware simulation will grow to support/require that in the future.
    switch (irq)
    {
        case TIMER_IRQ: 
            krnTimerISR();                   // Kernel built-in routine for timers (not the clock).
            break;
        case KEYBOARD_IRQ: 
            krnKeyboardDriver.isr(params);   // Kernel mode device driver
            _StdIn.handleInput();
            break;
        case SCHEDULER_IRQ:
            switch (params[0]) {
                case "switch":
                    krnSwitch();
                    break;
            }
            break;
        // Hard interrupts
        case SYS_OPCODE_IRQ:
          switch(params[0]) {
            case "print":
              _StdIn.handleSystemCall(params);
              break;
            case "break":
              krnKillProcess(params[1]);
              break;
          }
            break;
          case MEMORY_OUT_OF_BOUNDS_IRQ:
            krnKillProcess();
            break;

        default: 
            krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
    }
}

function krnTimerISR()  // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver).
{
    // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
}   

function krnSwitch()
{ 
  // Moves to the next process in round robin
  _CpuScheduler.rotate();

}

//
// System Calls... that generate software interrupts via tha Application Programming Interface library routines.
//
// Some ideas:
// - ReadConsole
// - WriteConsole
// - WaitForProcessToExit
// - CreateFile
// - OpenFile
// - ReadFile
// - WriteFile
// - CloseFile


// Handles everything for creating a process
function krnCreateProcess(program)
{    
    var pcbw = new PCBWrapper();
    var process = new PCB();
    process.init(getNextPID());

    // Attempt to allocate memory for program
    var partition = _memoryManager.allocate(program, process.getPid());
    // Physical Memory
    if (partition){
      process.setMemoryBounds(partition.low, RAM_SIZE/NUM_PARTITIONS); // Create process by passing in ID
      // Initialize the wrapper and write a null TSB because it's not loaded into the hdd
      pcbw.init(process, null);
    }
    // Virtual Memory
    else{
        var tsb = _memoryManager.allocateVirtualMemory(program, process.getPid());
        if (tsb){
          // Initialize the wrapper and let it know that the process is being held in virtual memory
          pcbw.init(process, tsb);
          console.log(pcbw);
        }
    }

    // Add process wrapper to the process list
    addProcessToList(pcbw);
    return process.getPid();
};

// This updates the resident list when the memory manager changes the state of the process wrappers
function updateProcessList(pcbws){
    for(var i = 0; i < _Processes.length; i++){
      for (var j = 0; j < pcbws.length; j++){
        if(pcbws[j].pcb.getPid() == _Processes[i].pcb.getPid()){
          _Processes[i] = pcbws[j];
        }
      }
    }
  };

function addProcessToList(pcbw){
  var pid = pcbw.pcb.getPid();
  _Processes[pid] = pcbw;
};

function updateProcessToList(pcbw){
  var pid = pcbw.pcb.getPid();
  _Processes[pid] = pcbw;
};

function deleteProcessFromList(pcbw){
  var pid = pcbw.pcb.getPid();

  delete _Processes[pid];
};

// For command line, assuming user isn't running this command while executing
function krnKill(pid)
{

  // Get the process wrapper
  var process = krnFindProcess(pid);

  if (process){

    // Do memory cleanup
    process.pcb.kill();

    removeProcessFromList(process);

    return true;
  }
  else{
    return false;
  }
};

function krnGetSchedule()
{
  return _CpuScheduler.currentAlgorithm;
};

function krnGetSchedules()
{
  return _CpuScheduler.SCHEDULING_ALGORITHMS;
};

function krnSetSchedule(name)
{  
  name = name.toUpperCase();
  for (var i = 0; i <_CpuScheduler.SCHEDULING_ALGORITHMS.length; i++){
    if (_CpuScheduler.SCHEDULING_ALGORITHMS[i] == name){
      _CpuScheduler.currentAlgorithm = name;
      return true;
    }
  }
  return "Scheduling algorithm not recognized";
};

// Remove head process from scheduler
function krnKillProcess(pcbw)
{
  _CpuScheduler.kill(pcbw);

};

// Schedules the process wrapper
function krnRunProcess(pid)
{ 
  var pcbw = krnFindProcess(pid);
  _CpuScheduler.schedule(pcbw);
};

// Returns a process given a process ID
function krnFindProcess(pid)
{
  for (var property in _Processes) {
    if (_Processes.hasOwnProperty(property)) {
        if (parseInt(property) === parseInt(pid)){
          return _Processes[pid];
        }
    }
  }
};

// Returns a list of the loaded process IDs
function krnGetProcessPids()
{
  var pids = [];
  for (var property in _Processes) {
    if (_Processes.hasOwnProperty(property)) {
        pids.push(_Processes[property].pcb.getPid());
    }
  }
  return pids;
};

// Sets CPU scheduler quantum value
function krnSetQuantum(quantum)
{
  _CpuScheduler.setQuantum(quantum);
};

function getNextPID(){
  return _nextPID++;
};

//
// OS Utility Routines
//
function krnTrace(msg)
{
   // Check globals to see if trace is set ON.  If so, then (maybe) log the message. 
   if (_Trace)
   {
      if (msg === "Idle")
      {
         // We can't log every idle clock pulse because it would lag the browser very quickly.
         if (_OSclock % 10 == 0)  // Check the CPU_CLOCK_INTERVAL in globals.js for an 
         {                        // idea of the tick rate and adjust this line accordingly.
            hostLog(msg, "OS");
            // Update the clock on the UI
            _StdIn.updateStatus();
         }         
      }
      else
      {
       hostLog(msg, "OS");
      }
   }
}
   
function krnTrapError(msg)
{
    hostLog("OS ERROR - TRAP: " + msg);
    _StdIn.bsod(msg);
    krnShutdown();
    _CPU.isExecuting = false;
}
