import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-csv-reader',
  templateUrl: './csv-reader.component.html',
  styleUrls: ['./csv-reader.component.scss']
})
export class CsvReaderComponent implements OnInit {

  csvRecords : Array<any> = [];
  readError : string = "";

  constructor() { }

  ngOnInit(): void {
  }

  fileChangeListener($event: any): boolean {

    const files = $event.target.files;

    if( files.length == 0 || files[0].type != 'text/csv' ){
      //file must be a csv
      this.readError = "Selected file must in CSV format.";
      return false;
    }

    const reader = new FileReader();
    reader.onload = () =>{
      let text = reader.result as string;
      if( text && text != null ){

        let body = text.split("\n");

        let headerready = false;
        if( body.length > 0 ){
          let headerrow = this.csvtoarray(body[0]);
          if( headerrow!.length >= 3
            && headerrow![0].toLowerCase() == 'name'
            && headerrow![1].toLowerCase() == 'context'
            && headerrow![2].toLowerCase() == 'appointment'){
            headerready = true;
          }
        }

        if(!headerready){
          this.readError = "The file must contain a header with entries \"Name\", \"Context\" and \"Appointment\" in that order. The \"Appointment\" field should either be \"Y\" or \"N\"";
        }
        else{
          this.csvRecords = [];
          for( let i = 1; i < body.length; i++ ){
            let csvarr = this.csvtoarray(body[i]);
            let name = csvarr![0];
            let context = csvarr![1];
            let appointment = csvarr![2];
            if( name.trim() != "" && context.trim() != "" ){
              this.csvRecords.push({
                "name" : name,
                "context" : context,
                "appointment" : (appointment && appointment.trim().toLowerCase()=='y') ? 'Yes' : 'No'
              });
            }
          }
        }

      }
    };
    reader.readAsText(files[0],'utf8');

    return true;

  }

  processfromfile(){
    if( this.csvRecords && this.csvRecords.length > 0 ){
      let carr : Array<any> = [];
      console.log("Do something with the records... " + this.csvRecords.length);
    }
  }

  // Return array of string values, or NULL if CSV string not well formed.
  csvtoarray(text:string) : Array<string> | null{
    const re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
    const re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
    // Return NULL if input string is not well formed CSV string.
    if (!re_valid.test(text)) return null;
    const a = [];                     // Initialize array to receive values.
    text.replace(re_value, // "Walk" the string using replace with callback.
      function(m0, m1, m2, m3) {
        // Remove backslash from \' in single quoted values.
        if      (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
        // Remove backslash from \" in double quoted values.
        else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
        else if (m3 !== undefined) a.push(m3);
        return ''; // Return empty string.
      });
    // Handle special case of empty last value.
    if (/,\s*$/.test(text)) a.push('');
    return a;
  };

}
