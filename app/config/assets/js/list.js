'use strict';
/* global odkTables, util, odkCommon, odkData */

var persons;
function display() {
    console.log("Persons list loading");
    
    loadPersons();
}

function loadPersons() {
    // SQL to get persons
    
    var varNames = "_id, C_DATE, C_NAME, C_NMENSAL, C_NUMEST"
    var sql = "SELECT " + varNames + 
        " FROM OPVCOVIDHC " +
        " ORDER BY C_NUMEST";
    persons = [];
    console.log("Querying database for included persons...");
    console.log(sql);
    var successFn = function( result ) {
        console.log("Found " + result.getCount() + " persons");
        for (var row = 0; row < result.getCount(); row++) {
            var rowId = result.getData(row,"_id");
            
            var C_DATE = result.getData(row,"C_DATE");
            var C_NAME = titleCase(result.getData(row,"C_NAME"));
            var C_NMENSAL = result.getData(row,"C_NMENSAL");
            var C_NUMEST = result.getData(row,"C_NUMEST");

            var p = { type: 'person', rowId, C_DATE, C_NAME, C_NMENSAL, C_NUMEST};
            console.log(p);
            persons.push(p);
        }
        console.log("loadPersons:", persons)
        populateView();
        return;
    }
    var failureFn = function( errorMsg ) {
        console.error('Failed to get persons from database: ' + errorMsg);
        console.error('Trying to execute the following SQL:');
        console.error(sql);
        alert("Program error Unable to look up persons.");
    }

    odkData.arbitraryQuery('OPVCOVIDHC', sql, null, null, null, successFn, failureFn);
}

function populateView() {
    var ul = $('#persons');
    ul.empty();
    $.each(persons, function() {
        console.log("test",this)
        var that = this;      
        
        // set text to display
        var displayText = setDisplayText(that);

        // list
        ul.append($("<li />").append($("<button />").attr('id',this.C_NUMEST + this.C_NAME).attr('class', '' + ' btn ' + this.type).append(displayText)));
                
        var btn = ul.find('#' + this.C_NUMEST + this.C_NAME);
        btn.on("click", function() {
            openForm(that);
        })
    });
}

function setDisplayText(person) {
    var date;
    if (person.C_DATE == "D:NS,M:NS,Y:NS" | person.C_DATE === null) {
       date = "Não Sabe";
    } else {
       date = formatDate(person.C_DATE);
    }
 
    var displayText = "Data: " + date + "<br />" + 
        "Nome: " + person.C_NAME + "<br />" +
        "Número de estudo: " + person.C_NUMEST + "<br />" +
        "Número na livro: " + person.NMENSAL;
    return displayText
 }

function formatDate(adate) {
    var d = adate.slice(2, adate.search("M")-1);
    var m = adate.slice(adate.search("M")+2, adate.search("Y")-1);
    var y = adate.slice(adate.search("Y")+2);
    var date = d + "/" + m + "/" + y;
    return date;
}

function openForm(person) {
    console.log("Preparing form for ", person);
    var rowId = person.rowId;

    odkTables.editRowWithSurvey(
            null,
            "OPVCOVIDHC",
            rowId,
            "OPVCOVIDHC",
            null,);
}

function titleCase(str) {
    if (!str) return str;
    return str.toLowerCase().split(' ').map(function(word) {
      return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
  }