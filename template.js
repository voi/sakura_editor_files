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

  var enum_templates = function(dir_path, items) {
    var folder = fsys.GetFolder(dir_path);

    for(var itr = new Enumerator(folder.Files); !itr.atEnd(); itr.moveNext()) {
      var file = itr.item();

      items.push({ 'name': fsys.GetBaseName(file), 'path': fsys.GetAbsolutePathName(file) });
    }
  };

  var get_templates = function() {
    var items = [];
    var dir_path;

    for(var i = 0, len = snippet_dirs.length; i < len; ++i) {
      dir_path = fsys.BuildPath(snippet_dirs[i], 'templates');

      if(fsys.FolderExists(dir_path)) {
        enum_templates(dir_path, items);
      }

      dir_path = fsys.BuildPath(snippet_dirs[i], 'sakura\\templates');

      if(fsys.FolderExists(dir_path)) {
        enum_templates(dir_path, items);
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

  var zero_padding10 = function(int, width) {
    return (int < 10 ? '0' : '' ) + int.toString()
  };

  var replace_holders = function(text) {
    var now = new Date();

    return text.replace(/%Y/, now.getYear())
      .replace(/%m/, zero_padding10(now.getMonth() + 1))
      .replace(/%d/, zero_padding10(now.getDate()))
      .replace(/%H/, zero_padding10(now.getHours()))
      .replace(/%M/, zero_padding10(now.getMinutes()))
      .replace(/%S/, zero_padding10(now.getSeconds()));
  };

  var items = get_templates();

  if(items.length <= 0) {
    return ;
  }

  var index1 = CreateMenu(1, items_to_menu(items));

  if(index1 <= 0) {
    return ;
  }

  var sr = new ActiveXObject('ADODB.Stream');

  sr.Type = 2;  // Text
  sr.charset = 'utf-8';
  sr.Open();
  sr.LoadFromFile(items[ index1 - 1 ].path);

  var text = sr.ReadText(-1); // ReadAll
  sr.Close();

  Editor.InsText(replace_holders(text), 4, 0);
})();
