(function(){
  var fsys = new ActiveXObject('Scripting.FileSystemObject');
  var svn_path = 'svn.exe';
  var tortoise_svn_path = 'TortoiseProc.exe';
  var command_list = [
  { 'name': 'svn &log',      'cmd': tortoise_svn_path + ' /command:log   /path:"%f"' },
  { 'name': 'svn &diff',     'cmd': tortoise_svn_path + ' /command:diff  /path:"%f"' },
  { 'name': 'svn &blame',    'cmd': tortoise_svn_path + ' /command:blame /path:"%f"' },
  { 'name': 'svn &update',   'cmd': svn_path + ' /command:update  /path:"%f"' },
  { 'name': 'svn &add',      'cmd': svn_path + ' /command:add     /path:"%f"' },
  { 'name': 'svn re&vert',   'cmd': svn_path + ' /command:log     /path:"%f"' },
  { 'name': 'svn &resolve',  'cmd': svn_path + ' /command:resolve /path:"%f"' },
  { 'name': '-', 'cmd': '' },
  { 'name': 'svn/root &log',    'cmd': tortoise_svn_path + ' /command:log    /path:"%d"' },
  { 'name': 'svn/root &add',    'cmd': tortoise_svn_path + ' /command:add    /path:"%d"' },
  { 'name': 'svn/root &diff',   'cmd': tortoise_svn_path + ' /command:diff   /path:"%d"' },
  { 'name': 'svn/root &update', 'cmd': tortoise_svn_path + ' /command:update /path:"%d"' },
  { 'name': 'svn/root &commit', 'cmd': tortoise_svn_path + ' /command:commit /path:"%d"' }
  ];

  var find_svn_root = function(filename) {
    var dir_path = fsys.GetParentFolderName(filename);

    while((dir_path !== '') && !fsys.FolderExists(fsys.BuildPath(dir_path, '.svn'))) {
      var dir_path = fsys.GetParentFolderName(dir_path);
    }

    if(dir_path === '') {
      var dir_path = fsys.GetParentFolderName(filename);
    }

    return dir_path;
  };

  var make_commandline = function(index, svn_root, filename) {
    return command_list[index].cmd
      .replace(/%d/, svn_root)
      .replace(/%f/, filename);
  };

  var filename = Editor.GetFilename();

  if(filename === '') {
    return ;
  }

  var menu_items = [];

  for(var i = 0, len = command_list.length; i < len; ++i) {
    menu_items.push(command_list[i].name);
  }

  var index1 = Editor.CreateMenu(1, menu_items.join(','));

  if(index1 <= 0) {
    return ;
  }

  var svn_root = find_svn_root(filename);

  Editor.ExecCommand(make_commandline(index1 - 1, svn_root, filename) , 0x200, svn_root);
})();
