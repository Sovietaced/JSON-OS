/* ------------
   Shell.js
   
   The OS Shell - The "command line interface" (CLI) for the console.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

function Shell() {
    // Properties
    this.promptStr   = ">";
    this.commandList = [];
    this.curses      = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
    this.apologies   = "[sorry]";
    this.cmdHistory = [];
    this.cmdHistoryLength = -1; 
    // Methods
    this.init        = shellInit;
    this.putPrompt   = shellPutPrompt;
    this.handleInput = shellHandleInput;
    this.execute     = shellExecute;
}

function shellInit() {
    var sc = null;
    //
    // Load the command list.

    // ver
    sc = new ShellCommand();
    sc.command = "ver";
    sc.description = "- Displays the current version data.";
    sc.function = shellVer;
    this.commandList[this.commandList.length] = sc;
    
    // ls
    sc = new ShellCommand();
    sc.command = "ls";
    sc.description = "- List the files in the current directory";
    sc.function = shellLs;
    this.commandList[this.commandList.length] = sc;

    // read
    sc = new ShellCommand();
    sc.command = "read";
    sc.description = "<filename> - Reads the values of the specified file";
    sc.function = shellRead;
    this.commandList[this.commandList.length] = sc;

    // write
    sc = new ShellCommand();
    sc.command = "write";
    sc.description = "<filename> <string> - Writes specified string to the specified file";
    sc.function = shellWrite;
    this.commandList[this.commandList.length] = sc;

     // create
    sc = new ShellCommand();
    sc.command = "create";
    sc.description = "<filename> <data> - Creates a file with specified data";
    sc.function = shellCreate;
    this.commandList[this.commandList.length] = sc;

    // delete
    sc = new ShellCommand();
    sc.command = "delete";
    sc.description = "<filename> - Deletes a file by the given name";
    sc.function = shellDelete;
    this.commandList[this.commandList.length] = sc;

    // date
    sc = new ShellCommand();
    sc.command = "date";
    sc.description = "- Displays the current date.";
    sc.function = shellDate;
    this.commandList[this.commandList.length] = sc;

     // testbsod
    sc = new ShellCommand();
    sc.command = "testbsod";
    sc.description = "- Tests the blue screen of death feature";
    sc.function = shellTestBSOD;
    this.commandList[this.commandList.length] = sc;

    // kill
    sc = new ShellCommand();
    sc.command = "kill";
    sc.description = "<int> - Kills a process by specified pid";
    sc.function = shellKill;
    this.commandList[this.commandList.length] = sc;

    // load
    sc = new ShellCommand();
    sc.command = "load";
    sc.description = "- Verifies that the user code is valid";
    sc.function = shellLoad;
    this.commandList[this.commandList.length] = sc;

    // ps
    sc = new ShellCommand();
    sc.command = "ps";
    sc.description = "- Process status. lists loaded processes";
    sc.function = shellPs;
    this.commandList[this.commandList.length] = sc;

    // getschedule
    sc = new ShellCommand();
    sc.command = "getschedule";
    sc.description = "- Returns the current process scheduling algorithm";
    sc.function = shellGetSchedule;
    this.commandList[this.commandList.length] = sc;

    // setschedule
    sc = new ShellCommand();
    sc.command = "setschedule";
    sc.description = " <string> - Set the current process scheduling algorithm";
    sc.function = shellSetSchedule;
    this.commandList[this.commandList.length] = sc;

    // listschedules
    sc = new ShellCommand();
    sc.command = "listschedules";
    sc.description = " - Lists the available scheduling algorithms";
    sc.function = shellListSchedules;
    this.commandList[this.commandList.length] = sc;

    // run
    sc = new ShellCommand();
    sc.command = "run";
    sc.description = "- Runs a program in memory specified by it's PID";
    sc.function = shellRun;
    this.commandList[this.commandList.length] = sc;

     // runall
    sc = new ShellCommand();
    sc.command = "runall";
    sc.description = "- Runs all loaded programs";
    sc.function = shellRunAll;
    this.commandList[this.commandList.length] = sc;

    // date
    sc = new ShellCommand();
    sc.command = "status";
    sc.description = "- Updates the status";
    sc.function = shellStatus;
    this.commandList[this.commandList.length] = sc;

    // whereami
    sc = new ShellCommand();
    sc.command = "whereami";
    sc.description = "- Displays where you are";
    sc.function = shellWhereami;
    this.commandList[this.commandList.length] = sc;

    // barrel roll
    sc = new ShellCommand();
    sc.command = "roll";
    sc.description = "- Does a barrel roll";
    sc.function = shellRoll;
    this.commandList[this.commandList.length] = sc;

    // help
    sc = new ShellCommand();
    sc.command = "help";
    sc.description = "- This is the help command. Seek help.";
    sc.function = shellHelp;
    this.commandList[this.commandList.length] = sc;
    
    // shutdown
    sc = new ShellCommand();
    sc.command = "shutdown";
    sc.description = "- Shuts down the virtual OS but leaves the underlying hardware simulation running.";
    sc.function = shellShutdown;
    this.commandList[this.commandList.length] = sc;

    // cls
    sc = new ShellCommand();
    sc.command = "cls";
    sc.description = "- Clears the screen and resets the cursor position.";
    sc.function = shellCls;
    this.commandList[this.commandList.length] = sc;

    // man <topic>
    sc = new ShellCommand();
    sc.command = "man";
    sc.description = "<topic> - Displays the MANual page for <topic>.";
    sc.function = shellMan;
    this.commandList[this.commandList.length] = sc;
    
    // trace <on | off>
    sc = new ShellCommand();
    sc.command = "trace";
    sc.description = "<on | off> - Turns the OS trace on or off.";
    sc.function = shellTrace;
    this.commandList[this.commandList.length] = sc;

    // rot13 <string>
    sc = new ShellCommand();
    sc.command = "rot13";
    sc.description = "<string> - Does rot13 obfuscation on <string>.";
    sc.function = shellRot13;
    this.commandList[this.commandList.length] = sc;

    // quantum <int> 
    sc = new ShellCommand();
    sc.command = "quantum";
    sc.description = "<int> - Sets the quantum value (clock ticks).";
    sc.function = shellQuantum;
    this.commandList[this.commandList.length] = sc;

    // prompt <string>
    sc = new ShellCommand();
    sc.command = "prompt";
    sc.description = "<string> - Sets the prompt.";
    sc.function = shellPrompt;
    this.commandList[this.commandList.length] = sc;

    // processes - list the running processes and their IDs
    // kill <id> - kills the specified process id.

    //
    // Display the initial prompt.
    this.putPrompt();
}

function shellPutPrompt()
{
    _StdIn.putText(this.promptStr);
}

function shellHandleInput(buffer)
{
    krnTrace("Shell Command~" + buffer);
    // 
    // Parse the input...
    //
    var userCommand = new UserCommand();
    userCommand = shellParseInput(buffer);
    // ... and assign the command and args to local variables.
    var cmd = userCommand.command;
    var args = userCommand.args;
    //
    // Determine the command and execute it.
    //
    // JavaScript may not support associative arrays in all browsers so we have to
    // iterate over the command list in attempt to find a match.  TODO: Is there a better way? Probably.
    var index = 0;
    var found = false;
    while (!found && index < this.commandList.length)
    {
        if (this.commandList[index].command === cmd)
        {
            found = true;
            var fn = this.commandList[index].function;
        }
        else
        {
            ++index;
        }
    }
    if (found)
    {
        this.execute(fn, args);
    }
    else
    {
        // It's not found, so check for curses and apologies before declaring the command invalid.
        if (this.curses.indexOf("[" + rot13(cmd) + "]") >= 0)      // Check for curses.
        {
            this.execute(shellCurse);
        }
        else if (this.apologies.indexOf("[" + cmd + "]") >= 0)      // Check for apologies.
        {
            this.execute(shellApology);
        }
        else    // It's just a bad command.
        {
            this.execute(shellInvalidCommand);
        }
    }
}

function shellParseInput(buffer)
{
    var retVal = new UserCommand();

    // 1. Remove leading and trailing spaces.
    buffer = trim(buffer);

    // 2. Lower-case it.
    buffer = buffer.toLowerCase();

    // 3. Separate on spaces so we can determine the command and command-line args, if any.
    var tempList = buffer.split(" ");

    // 4. Take the first (zeroth) element and use that as the command.
    var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript.  See the Queue class.
    // 4.1 Remove any left-over spaces.
    cmd = trim(cmd);
    // 4.2 Record it in the return value.
    retVal.command = cmd;

    // 5. Now create the args array from what's left.
    for (var i in tempList)
    {
        var arg = trim(tempList[i]);
        if (arg != "")
        {
            retVal.args[retVal.args.length] = tempList[i];
        }
    }
    return retVal;
}

function shellExecute(fn, args)
{
    // We just got a command, so advance the line...
    _StdIn.advanceLine();
    // ... call the command function passing in the args...
    fn(args);
    // Check to see if we need to advance the line again
    if (_StdIn.CurrentXPosition > 0)
    {
        _StdIn.advanceLine();
    }
    // ... and finally write the prompt again.
    this.putPrompt();
}


//
// The rest of these functions ARE NOT part of the Shell "class" (prototype, more accurately), 
// as they are not denoted in the constructor.  The idea is that you cannot execute them from
// elsewhere as shell.xxx .  In a better world, and a more perfect JavaScript, we'd be
// able to make then private.  (Actually, we can. have a look at Crockford's stuff and Resig's JavaScript Ninja cook.)
//

//
// An "interior" or "private" class (prototype) used only inside Shell() (we hope).
//
function ShellCommand()     
{
    // Properties
    this.command = "";
    this.description = "";
    this.function = "";
}

//
// Another "interior" or "private" class (prototype) used only inside Shell() (we hope).
//
function UserCommand()
{
    // Properties
    this.command = "";
    this.args = [];
}


//
// Shell Command Functions.  Again, not part of Shell() class per se', just called from there.
//
function shellInvalidCommand()
{
    _StdIn.putText("Invalid Command. ");
    if (_SarcasticMode)
    {
        _StdIn.putText("Duh. Go back to your Speak & Spell.");
    }
    else
    {
        _StdIn.putText("Type 'help' for, well... help.");
    }
}

function shellKill(args)
{
    // get value from html text area
    var pid = args[0];
    if (parseInt(pid) >= 0) {
        if(krnKill(pid)){
             _StdIn.putText("Process " + pid + " killed.");
        }
        else{
            _StdIn.putText("Failed to find process with PID " + pid + ".");
        }
    } else {
        _StdIn.putText("The PID must be a valid integer");
    }

}

function shellCurse()
{
    _StdIn.putText("Oh, so that's how it's going to be, eh? Fine.");
    _StdIn.advanceLine();
    _StdIn.putText("Bitch.");
    _SarcasticMode = true;
}

function shellApology()
{
   if (_SarcasticMode) {
      _StdIn.putText("Okay. I forgive you. This time.");
      _SarcasticMode = false;
   } else {
      _StdIn.putText("For what?");
   }
}

function shellVer(args)
{
    _StdIn.putText(APP_NAME + " version " + APP_VERSION);    
}

function shellLs()
{
    _StdIn.putText(krnListFiles());
}

function shellRead(args)
{   
    var name = args[0];
    _StdIn.putText(krnReadFile(name));
}

function shellWrite(args)
{   
    if (args.length > 0){

        var name = args[0];
        var data = args.slice(1,args.length).join(" ");
        var result = krnWriteFile(name,data);

        if (result == true){
            _StdIn.putText("Data written to file " + name + ".");
        }
        else{
            _StdIn.putText(result);
        }

    }
    else{
        _StdIn.putText("Missing file name argument!");
    }
}

function shellCreate(args)
{   
    if (args.length > 0){

        var name = args[0];
        var data = args.slice(1,args.length).join(" ");
        var result = krnCreateFile(name,data);

        if (result == true){
            _StdIn.putText("File " + name + " created.");
        }
        else{
            _StdIn.putText(result);
        }

    }
    else{
        _StdIn.putText("Missing file name argument!");
    }
}

function shellDelete(args)
{   
    //TODO : Error checking
    var name = args[0];

    krnDeleteFile(name);
}

function shellDate(args)
{   
    var d = new Date();
    var curr_date = d.getDate();
    var curr_month = d.getMonth() + 1; //Months are zero based
    var curr_year = d.getFullYear();
    _StdIn.putText(curr_month + "-" + curr_date + "-" + curr_year);
}

function shellTestBSOD(args)
{   
    _StdIn.bsod();
}

function shellPs()
{
    _StdIn.putText("PID");
    _StdIn.advanceLine();

    var pids = krnGetProcessPids();

    for (var i = 0; i < pids.length; i++ ){
        _StdIn.putText(pids[i].toString());
        _StdIn.advanceLine();
    }
}

function shellGetSchedule()
{   
    _StdIn.putText(krnGetSchedule());
}

function shellSetSchedule(args)
{   
    if (args.length > 0){

        var name = args[0];

        var result = krnSetSchedule(name);

        if (result == true){
            _StdIn.putText("Schedule set.");
        }
        else{
            _StdIn.putText(result);
        }

    }
    else{
        _StdIn.putText("Missing scheduling algorithm argument!");
    }
}

function shellListSchedules()
{   
    var algos = krnGetSchedules();
    var str = '';

    for(var i = 0; i < algos.length; i++){
        str += algos[i] + ' ';
    }

    _StdIn.putText(str);
}

function shellRun(args)
{   
    // get value from html text area
    var pid = args[0];
    if (parseInt(pid) >= 0) {
        var pcbw = krnFindProcess(pid);
        if (pcbw){
            console.log("WTF");
            console.log(pcbw);
             _StdIn.putText("Running process with PID " + pid + "...");
            var result = krnRunProcess(pid);
            return;
        }
        else{
            _StdIn.putText("Failed to find process with PID " + pid + ".");
        }
    } else {
        _StdIn.putText("The PID must be a valid integer");
    }
}

function shellRunAll(args)
{   

    _StdIn.putText("Running all loaded processes...");
    _StdIn.advanceLine();

    var pids = krnGetProcessPids();
    
    if (pids.length > 0) {
        for (var i = 0; i < pids.length; i++ ){
                krnRunProcess(pids[i]);
        }
    }    
    else{
        _StdIn.putText("No processes loaded.");
    }
}

function shellLoad(args)
{   
    // get value from html text area
    var user_input = $('textarea#taProgramInput').val();
    // Remove whitespace
    user_input = user_input.replace(/ /g,'');
    // Remove new lines
    user_input = user_input.replace(/(\r\n|\n|\r)/gm,"");

    if (user_input.match(/^[0-9A-F]/i)) {

        var result = krnCreateProcess(user_input);
        if(isNumber(result)){
            _StdIn.putText("Program loaded with PID " + result );
        } else {
            _StdIn.putText("Failed to load program.");
        }
         // Clear text area
        $('textarea#taProgramInput').val("");
    }
    else{
        _StdIn.putText("User input must be in Hex.");
    }
}

function shellStatus(args)
{
   if (args.length > 0)
    {
        var status = args[0];
        _StdIn.updateStatus(status);   
    }
    else
    {
        _StdIn.putText("Usage: status <status>  Please supply a status");
    }
}

function shellWhereami(args)
{
    // Check to see that browser supports geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            _StdIn.putText("You're at (" + position.coords.latitude + "," +
                position.coords.longitude + ").");
        }, function(error) {
            _StdIn.putText("Failed to determine your geolocation");
        });
    } else {
        _StdIn.putText("Turn on location sharing and I might tell you.");
    }
}

function shellRoll(args)
{   
    jQuery('body').addClass('barrel_roll');
    setTimeout(function(){
    jQuery('body').removeClass('barrel_roll');
    },4000);
}

function shellHelp(args)
{
    _StdIn.putText("Commands:");
    for (var i in _OsShell.commandList)
    {
        _StdIn.advanceLine();
        _StdIn.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
    }    
}

function shellShutdown(args)
{
     _StdIn.putText("Shutting down...");
     // Call Kernel shutdown routine.
    krnShutdown();   
    // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
}

function shellCls(args)
{
    _StdIn.clearScreen();
    _StdIn.resetXY();
}

function shellMan(args)
{
    if (args.length > 0)
    {
        var topic = args[0];
        switch (topic)
        {
            case "help": 
                _StdIn.putText("Help displays a list of (hopefully) valid commands.");
                break;
            default:
                _StdIn.putText("No manual entry for " + args[0] + ".");
        }        
    }
    else
    {
        _StdIn.putText("Usage: man <topic>  Please supply a topic.");
    }
}

function shellTrace(args)
{
    if (args.length > 0)
    {
        var setting = args[0];
        switch (setting)
        {
            case "on": 
                if (_Trace && _SarcasticMode)
                {
                    _StdIn.putText("Trace is already on, dumbass.");
                }
                else
                {
                    _Trace = true;
                    _StdIn.putText("Trace ON");
                }
                
                break;
            case "off": 
                _Trace = false;
                _StdIn.putText("Trace OFF");                
                break;                
            default:
                _StdIn.putText("Invalid arguement.  Usage: trace <on | off>.");
        }        
    }
    else
    {
        _StdIn.putText("Usage: trace <on | off>");
    }
}

function shellRot13(args)
{
    if (args.length > 0)
    {
        _StdIn.putText(args[0] + " = '" + rot13(args[0]) +"'");     // Requires Utils.js for rot13() function.
    }
    else
    {
        _StdIn.putText("Usage: rot13 <string>  Please supply a string.");
    }
}

function shellQuantum(args)
{
    if (args.length > 0)
    {
        var quantum = parseInt(args[0]);
        if(isNumber(quantum)){
            krnSetQuantum(quantum);
            _StdIn.putText("Quantum value set to " + quantum + ".");
        } 
    }
    else
    {
        _StdIn.putText("Usage: rot13 <string>  Please supply a string.");
    }
}

function shellPrompt(args)
{
    if (args.length > 0)
    {
        _OsShell.promptStr = args[0];
    }
    else
    {
        _StdIn.putText("Usage: prompt <string>  Please supply a string.");
    }
}
