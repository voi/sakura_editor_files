(function(){
  var keyword = Editor.ExpandParameter( '$C' );

  if( keyword == '' ){
    keyword = Editor.GetSelectedString( 0 );
  }

  if( keyword == '' ){
    keyword = Editor.InputBox( 'grep word?', '', 128 );
  }

  if( keyword == '' ){
    return ;
  }

  Editor.ExecCommand( '( global -aqx -d  ' + keyword + ' & '
                      + 'global -aqx -sr ' + keyword + ' )', 0x01 | 0x20 | 0x200 );
  Editor.ActivateWinOutput();
})();
