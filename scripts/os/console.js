/* ------------
   Console.js

   Requires globals.js

   The OS Console - stdIn and stdOut by default.
   Note: This is not the Shell.  The Shell is the "command line interface" (CLI) or interpreter for this console.
   ------------ */

function CLIconsole() {
    // Properties
    this.CurrentFont      = _DefaultFontFamily;
    this.CurrentFontSize  = _DefaultFontSize;
    this.CurrentXPosition = 0;
    this.CurrentYPosition = _DefaultFontSize;
    this.buffer = "";
    this.status_height = 20;
    this.console_height = 0;
    this.status_ = "type status <status>";
    // Methods
    this.init = function() {
       this.clearScreen();
       this.resetXY();
       this.console_height = _Canvas.height - this.status_height;
    };

    this.clearScreen = function() {
       _DrawingContext.clearRect(0, 0, _Canvas.width, this.console_height);
    };

    this.resetXY = function() {
       this.CurrentXPosition = 0;
       this.CurrentYPosition = this.CurrentFontSize;
    };

    this.handleInput = function() {
       while (_KernelInputQueue.getSize() > 0)
       {
           // Get the next character from the kernel input queue.
           var chr = _KernelInputQueue.dequeue();
           // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
           // Handle Enter Key

           if (chr == String.fromCharCode(13))
           {
               // The enter key marks the end of a console command, so ...
               // ... tell the shell ...
                 _OsShell.cmdHistoryLength = _OsShell.cmdHistory.length;
                 _OsShell.handleInput(this.buffer);

                 // We only want to store history if its GOOD history
                if(this.buffer !== ""){
                 _OsShell.cmdHistory.push(this.buffer);
                 // ... and reset our buffer.
                 this.buffer = "";
                 }           
              }
           // Handle up - Command History
           else if (chr == String.fromCharCode(38))
           {
                if (_OsShell.cmdHistoryLength > 0)
                {
                  _OsShell.cmdHistoryLength--;
                  this.buffer = _OsShell.cmdHistory[_OsShell.cmdHistoryLength];
                  this.clearLine(this.buffer);
                }
           }
            // Handle down - Command History
           else if (chr == String.fromCharCode(40))
           {
                if (_OsShell.cmdHistoryLength < _OsShell.cmdHistory.length)
                {
                  _OsShell.cmdHistoryLength++;
                  this.buffer = _OsShell.cmdHistory[_OsShell.cmdHistoryLength];
                  this.clearLine(this.buffer);
                }
                else
                {
                  this.buffer = "";
                  this.clearLine();
                }
           }
           // Handle backspaces
           else if (chr == String.fromCharCode(8))
           {
            buffer = this.buffer
            chr = buffer.slice(-1);
            this.buffer = buffer.slice(0, -1);
            this.clearLine(this.buffer);
           }
           // TODO: Write a case for Ctrl-C.
           else
           {
               // This is a "normal" character, so ...
               console.log(chr);
               // ... draw it on the screen...
               this.putText(chr);
               // ... and add it to our buffer.
               this.buffer += chr;
           }
       }
    };

    // Handles system call from 6502 instruction set
    this.handleSystemCall = function() {
      // Print the Y register
       if (_CPU.Xreg == 1){
        _StdIn.advanceLine();
        _StdIn.putText(_CPU.Yreg.toString());
        }
        // Print the 00 terminated string located in memory at location Yreg
        if (_CPU.Xreg == 2){
            // Get value from memory
            var memory = _memoryManager.readMemory(memLocation);
            var zeroTermString = "";
            // Continue while not 00 terminated
            while (memory != "00"){
              zeroTermString += String.fromCharCode(hexToInt(memory));
              memory = _memoryManager.readMemory(++memLocation);
            }
            _StdIn.advanceLine();
            _StdIn.putText(zeroTermString);
        }
    };

    this.updateStatus = function(status) {

      // Update time
      currentdate = new Date();
      var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();

      if (status){
        this.status_ = status
      }
        // Clear the status area
        _DrawingContext.clearRect(0, this.console_height, _Canvas.width, _Canvas.height);
       // Draw a rectangle with a border
       _DrawingContext.strokeRect(0,this.console_height,_Canvas.width, _Canvas.height);
        // Draw the text at the current X and Y coordinates.
        _DrawingContext.drawText(this.CurrentFont, this.CurrentFontSize, 5, this.console_height + 15, datetime + " Status : " + this.status_);
    };

    this.clearLine = function(text) {
        // Determine beginning coordinates for the area we wish to clear
        rect_y = this.CurrentYPosition - (_DefaultFontSize) - 2 ;
        this.CurrentXPosition = 0;
        
        // Clear the entire line
        _DrawingContext.clearRect(this.CurrentXPosition, rect_y, _Canvas.width, this.CurrentYPosition + 4);
        
        // Print the prompt
        _OsShell.putPrompt();

        // Update the status
        this.updateStatus();

        // Print any text passed
        if(text)
        {
          this.putText(text);
        }
    };

    this.putText = function(text) {
       if (text !== "")
       {
           // Draw the text at the current X and Y coordinates.
           _DrawingContext.drawText(this.CurrentFont, this.CurrentFontSize, this.CurrentXPosition, this.CurrentYPosition, text);
         // Move the current X position.
           var offset = _DrawingContext.measureText(this.CurrentFont, this.CurrentFontSize, text);
           this.CurrentXPosition = this.CurrentXPosition + offset;
       }
    };

    this.advanceLine = function() {
       this.CurrentXPosition = 0;
       this.CurrentYPosition += _DefaultFontSize + _FontHeightMargin;

       // Implement scrolling if we are running out of space
       if (this.CurrentYPosition > this.console_height)
       {
        // Take a snapshot of the canvas with the newest output
        var img = _DrawingContext.getImageData(0, 0, _Canvas.width, this.console_height);
        // Clear the canvas
        this.clearScreen();
        // Paint the snapshot shifted upwards by the line height
        _DrawingContext.putImageData(img, 0, (_DefaultFontSize + _FontHeightMargin) * -1);
        // Adjust position accordingly
        this.CurrentYPosition -= _DefaultFontSize + _FontHeightMargin;
      }
    };

    // Blue screen of death yall!
    this.bsod = function(msg) {
      _DrawingContext.fillStyle="blue";
      _DrawingContext.fillRect(0, 0, _Canvas.width, _Canvas.height);

       // Draw the text in the middle in some big fat font
       _DrawingContext.font = '20pt Calibri';
       _DrawingContext.fillStyle="white";
      _DrawingContext.fillText(msg, (100), (_Canvas.height/2));
    };
}
