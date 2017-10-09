(function(){
  var fsys = new ActiveXObject('Scripting.FileSystemObject');
  var shell = new ActiveXObject('WScript.Shell');
  var user_env = shell.Environment('USER');
  var snippet_dirs = [
    shell.SpecialFolders('MyDocuments'),
    user_env('HOMEPATH'),
    user_env('HOME')
  ];

  var get_snippets = function() {
    var filter = /\.snip$/;
    var items = [];

    for(var i = 0, len = snippet_dirs.length; i < len; ++i) {
      var dir = fsys.BuildPath(snippet_dirs[i], 'snippets');

      if(fsys.FolderExists(dir)) {
        var folder = fsys.GetFolder(dir);

        for(var itr = new Enumerator(folder.Files); !itr.atEnd(); itr.moveNext()) {
          var file = itr.item();

          if(filter.test(file)) {
            items.push({ 'name': fsys.GetBaseName(file), 'path': fsys.GetAbsolutePathName(file) });
          }
        }
      }
    }

    return items;
  };

  var items_to_menu = function(items) {
    var menu = [];

    for(var i = 0, len = items.length; i < len; ++i) {
      menu.push(items[i].name);
    }

    return menu.join(',');
  };

  var items = get_snippets();

  if(items.length <= 0) {
    return ;
  }

  var index1 = Editor.CreateMenu(1, items_to_menu(items));

  if(index1 <= 0) {
    return ;
  }

  Editor.InsFile(items[ index1 - 1 ].path, 4, 0);
})();
