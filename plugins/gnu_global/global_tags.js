(function(){
  var keyword = Editor.ExpandParameter('$C');

  if (keyword == '') {
    keyword = Editor.GetSelectString(0);
  }

  if (keyword == '') {
    return ;
  }

  Editor.ExecCommand('global -aqx -sr ' + keyword, 0x01 | 0x20 | 0x200);
  Editor.ActivateWinOutput();
})();
