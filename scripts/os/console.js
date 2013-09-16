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
    
    // Methods
    this.init = function() {
       this.clearScreen();
       this.resetXY();
    };

    this.clearScreen = function() {
       _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
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
               _OsShell.cmdHistory.push(this.buffer);
               _OsShell.cmdHistoryLength = _OsShell.cmdHistory.length;
               _OsShell.handleInput(this.buffer);
               // ... and reset our buffer.
               this.buffer = "";
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
                console.log(_OsShell.cmdHistoryLength);
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
                console.log(_OsShell.cmdHistoryLength);
           }
           // Handle backspaces
           else if (chr == String.fromCharCode(8))
           {
            buffer = this.buffer
            chr = buffer.slice(-1);
            this.buffer = buffer.slice(0, -1);
            this.removeText(chr);
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

    this.clearLine = function(text) {
        // Determine beginning coordinates for the area we wish to clear
        rect_y = this.CurrentYPosition - (_DefaultFontSize);
        this.CurrentXPosition = 0;
        
        // Clear the entire line
        _DrawingContext.clearRect(this.CurrentXPosition, rect_y, _Canvas.width, this.CurrentYPosition);
        
        // Print the prompt
        _OsShell.putPrompt();

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

    // Used for backspace
    this.removeText = function(text) {
      if (text !== "")
       {
        // Determine beginning coordinates for the area we wish to clear
        rect_x = this.CurrentXPosition - _DrawingContext.measureText(this.CurrentFont, this.CurrentFontSize, text);
        rect_y = this.CurrentYPosition - (_DefaultFontSize);
        
        // Clear the Area
        _DrawingContext.clearRect(rect_x, rect_y, this.CurrentXPosition, this.CurrentYPosition);
        
        // Move the current X position.
         var offset = _DrawingContext.measureText(this.CurrentFont, this.CurrentFontSize, text);
         this.CurrentXPosition -= offset;
      }
    };

    this.advanceLine = function() {
       this.CurrentXPosition = 0;
       this.CurrentYPosition += _DefaultFontSize + _FontHeightMargin;
       // TODO: Handle scrolling.
    };
}
