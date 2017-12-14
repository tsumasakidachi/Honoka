self.addEventListener("message", function(e){
    var data = e.data;
    self.postMessage(data);
}, false);