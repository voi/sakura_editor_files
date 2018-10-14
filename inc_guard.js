(function(){
  var fname = Editor.ExpandParameter('$f');

  fname = '_INC_' + fname.replace(/\./, '_') + '_';
  fname = Editor.InputBox('Include Guard', fname.toUpperCase(), 256);

  if( fname === '' ) {
    return ;
  }

  var eol = ['\r\n', '\r', '\n'][Editor.GetLineCode()];
  var lines = [
    '#ifndef ' + fname,
    '#define ' + fname,
    '',
    '#endif // ' + fname,
    ''
  ];

  Editor.InsText(lines.join(eol));
})();
