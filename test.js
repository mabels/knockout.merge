// test
// started with node test.js
// 
var util = require('util')
var ko = require('knockout')

ko.merger=require('./knockout.merge.js')

src = {
  meno: {
    lala: {
      actions: 45
    },
    lili: {
      actions: [{ 
        name: "bitte waehlen",
        path: ""
      },{
        name: "Details",
        path: "http://www.google.de"
      },{
        name: "Irgendwas",
        path: "http://www.google.de"
      }]
    }
  }
}

var actionsMapper = {
  "meno.lili.actions": function(dest, src, recurse) {
    console.log("ACTOR: meno.lili.actions")
    if (dest == null || typeof(dest) != "function") { 
       console.log("+++++++++++++++++++++++++++++ NEW DEST")
       dest = ko.observableArray();
    }
    var destKeys = {} 
    var destValue = dest()
    for(var i = destValue.length-1; i>= 0; --i) {
      destKeys[destValue[i].name()] = destValue[i]
    }
    for(var i = 0; i < src.length; ++i) {
      var destValue = destKeys[src[i].name]
      if (destValue) {
        destValue.name(src[i].name)
        destValue.path(src[i].path)
        delete destKeys[src[i].name]
      } else {
        dest.push(ko.merger.merge(null, null, src[i]))
      }
    }
    /*
    dest.remove(function(item) { 
      return !!destKeys[item.name]  
    })
    */
    return dest;
  }
}

dest = ko.merger.merge(actionsMapper, null, src);
console.log("*************************************")
src = {
  meno: {
    lala: {
      actions: "kdkdkdkdkdkdk"
    },
    lili: {
      actions: [{ 
        name: "bitte waehlen",
        path: "http://www.spiegel.de"
      },{
        name: "CrossOver",
        path: "http://www.google.de"
      }]
    }
  }
}
ko.merger.merge(actionsMapper, dest, src);
console.log("*************************************")
console.log(util.inspect(ko.merger.toObject(dest), null, null))

