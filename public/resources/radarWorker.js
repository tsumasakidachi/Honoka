self.onmessage = function(e)
{
  switch (e.data.command)
  {
    case 'initialize':
      initialize();
      break;
    case 'update':
      update(e.data.me, e.data.blocks, e.data.entities);
      break;
    default:
      console.error("ERROR FROM worker.js: SWITCH STATEMENT ERROR IN self.onmessage");
  }
};

this.initialize = function()
{
}

this.update = function(me, blocks, entities)
{
  self.postMessage({});
}