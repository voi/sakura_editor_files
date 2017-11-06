(function(){
  var fsys = new ActiveXObject('Scripting.FileSystemObject');
  var shell = new ActiveXObject('WScript.Shell');
  var user_env = shell.Environment('USER');
  var snippet_dirs = [
    shell.SpecialFolders('MyDocuments'),
    user_env('HOMEPATH'),
    user_env('HOME'),
    fsys.GetParentFolderName(Editor.ExpandParameter('$S'))
  ];

  var strftime = function(format) {
    var now = new Date();

    return format.replace(/%[YmdHMS]/g, function(c) {
      switch(c) {
        case '%Y':
          return now.getYear().toString();
        case '%m':
          return (now.getMonth() + 100).toString().slice(1);
        case '%d':
          return (now.getDate() + 100).toString().slice(1);
        case '%H':
          return (now.getHours() + 100).toString().slice(1);
        case '%M':
          return (now.getMinutes() + 100).toString().slice(1);
        case '%S':
          return (now.getSeconds() + 100).toString().slice(1);
        default:
          return c;
      }
    });
  };

  var parse_snippet_body = function(line) {
    return line.replace(/\$\{`(.+?)`\}/g, function(c, p1) {
      return eval(p1);
    }).replace(/\$\{\d+?\}/g, '');
  };

  var parse_snippets = function(filepath) {
    var file = fsys.GetFile(filepath);
    var lines = file.ReadAll().split('\n');

    file.Close();

    var pattern_snip_name = /^snippet\s+(\S+).*$/;
    var pattern_snip_body = /^(?:    |\t)(.*)/;
    var snippets = {};
    var last_name = '';

    for(var i = 0, len = lines.length; i < len; ++i) {
      var line = lines[i];

      if(pattern_snip_name.test(line)) {
        last_name = RegExp.$1;

        snippets[last_name] = [];
      }
      else if(pattern_snip_body.test(line) && (last_name.length > 0)) {
        snippets[last_name].push(parse_snippet_body(RegExp.$1));
      }
    }

    return snippets;
  };

  var enum_snippets = function(dir_path, items) {
    var folder = fsys.GetFolder(dir_path);

    for(var itr = new Enumerator(folder.Files); !itr.atEnd(); itr.moveNext()) {
      var file = itr.item();

      items.push({ 'name': fsys.GetBaseName(file), 'path': fsys.GetAbsolutePathName(file) });
    }
  };

  var get_snippets = function() {
    var items = [];
    var dir_path;

    for(var i = 0, len = snippet_dirs.length; i < len; ++i) {
      dir_path = fsys.BuildPath(snippet_dirs[i], 'snippets');

      if(fsys.FolderExists(dir_path)) {
        enum_snippets(dir_path, items);
      }

      dir_path = fsys.BuildPath(snippet_dirs[i], 'sakura\\snippets');

      if(fsys.FolderExists(dir_path)) {
        enum_snippets(dir_path, items);
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

  var index1 = CreateMenu(1, items_to_menu(items));

  if(index1 <= 0) {
    return ;
  }

  Editor.InsFile(items[ index1 - 1 ].path, 4, 0);
})();
