// ただし一部のマクロ関数は、従来は桁数を返却しましたが今版からはピクセル幅を返すように仕様変更しました。
// * GetSelectColmFrom
// * GetSelectColmTo
// * GetStrLayoutLength
// * GetViewColumns
(function() {
  var change_selection_start_column1 = function() {
    // 開始行 1桁目から選択した状態に変更する
    var line_begin = Editor.LayoutToLogicLineNum( Editor.GetSelectLineFrom() );
    var line_end = Editor.LayoutToLogicLineNum( Editor.GetSelectLineTo() );
    var column_end = Editor.LineColumnToIndex( Editor.GetSelectLineTo(), Editor.GetSelectColumnTo() );

    Editor.MoveCursor( line_begin, 1, 0 );
    Editor.MoveCursor( line_end, column_end, 1 );
  };

  var tokenize = function(context, lines) {
    var tokens_list = [];

    for(var i = 0, len = lines.length; i < len; ++i) {
      var line = lines[i];
      tokens_list.push(line.replace(context.pattern, context.sub).split('\f'));
    }

    return tokens_list;
  };

  var get_alignment_width = function(tokens_list) {
    var width = -1;

    for(var i = 0, len = tokens_list.length; i < len; ++i) {
      if(tokens_list[i].length > 1) {
        width = Math.max(width, Editor.GetStrWidth(tokens_list[i][0]));
      }
    }

    return width;
  };

  var padding_ = function(context, str) {
    var base_str = str.replace(/\s+$/, '');
    var base_width = Editor.GetStrWidth(base_str);

    return base_str + context.padding(base_width);
  };

  var align_lines = function(context, tokens_list) {
    if(context.with_space) {
      context.width += context.tabstop;
    }

    for(var i = 0, len = tokens_list.length; i < len; ++i) {
      if(tokens_list[i].length > 1) {
        var token = tokens_list[i].shift();
        tokens_list[i][0] = padding_(context, token) + tokens_list[i][0];
      }
    }
  };

  var parse_args = function(cmdline) {
    // <http://www.m-bsys.com/code/javascript-repeatstring>
    var padding_space = function(base_width) {
      return Array(Math.max(this.width - base_width, 0)).join(' ');
    };

    var padding_tab = function(base_width) {
      var margin = Math.max(this.width - base_width, 0);

      return Array(parseInt(margin / this.tabstop) + ((margin % this.tabstop > 0) ? 2 : 1)).join('\t');
    };

    // ----------------
    // -g   global:        align all tokens
    // -1   1st:           align first token (default)
    // ----
    // -t   tab:           use tab ('\t')
    // -w   use_tab:       use space (' ') (default)
    // ----
    // -a   after:         align at after specified pattern
    // -h   just here:     align at specified pattern (default)
    // ----
    // -r   regexp:        pattern as regexp
    // -e   text:          pattern as text (default)
    // ----
    // -n   without space: not separete pattern
    // -s   with space:    separete pattern (default)
    // ----------------
    var context = {
      'pattern': '',
      'sub': '\f$&',
      'tabstop': 1,
      'padding' : padding_space,
      'width': 0,
      'with_space': true
    };
    var opt_global  = '';
    var use_regexp = false;
    var tab_width  = Editor.GetStrWidth('\t');

    var opt_pat = cmdline.replace(/^\s*((?:-[g1twahersn]\s+)*)/, '$1\n').split(/\n/);

    for(var opt in opt_pat[0].split(/\s+/)) {
      if     (opt === '-g'){ opt_global = 'g'; }
      else if(opt === '-1'){ opt_global = ''; }
      else if(opt === '-t'){ context.tabstop = tab_width; context.padding = padding_tab; }
      else if(opt === '-w'){ context.tabstop = 1; context.padding = padding_space; }
      else if(opt === '-a'){ context.sub = '$&\f'; }
      else if(opt === '-h'){ context.sub = '\f$&'; }
      else if(opt === '-r'){ use_regexp = true; }
      else if(opt === '-e'){ use_regexp = false; }
      else if(opt === '-s'){ context.with_space = true; }
      else if(opt === '-n'){ context.with_space = false; }
    }

    if(use_regexp) {
      context.pattern = new RegExp(opt_pat[1].replace(/^\s*|\s*$/g, ''), opt_global);
    }
    else {
      context.pattern = new RegExp(opt_pat[1]
        .replace(/[\\\/\[\]\(\)\{\}\?\+\*\|\.\^\$]/g, '\\$&')
        .replace(/^\s*|\s*$/g, ''), opt_global);
    }

    return context;
  };

  var align = function(cmdline) {
    var line_code = ['\r\n', '\r', '\n'][Editor.GetLineCode()];
    var context = parse_args(cmdline);

    if(context.pattern === '') {
      return Editor.GetSelectedString(0);
    }

    var tokens_list = tokenize(context, Editor.GetSelectedString(0).split(line_code));

    context.width = get_alignment_width(tokens_list);

    while(context.width >= 0) {
      align_lines(context, tokens_list);

      context.width = get_alignment_width(tokens_list);
    }

    var lines = [];

    for(var i = 0, len = tokens_list.length; i < len; ++i) {
      lines.push(tokens_list[i][0]);
    }

    return lines.join(line_code);
  };

  // ------------------------------------------------------------------------
  var get_cmdline = function() {
    return Editor.InputBox('Align [-g -1 -t -w -a -h -e -r] [token]', '', 256);
  };

  switch(Editor.IsTextSelected()) {
    case 0:   // non-selected
      break;

    case 1:   // selected
      var cmdline = get_cmdline();

      if(cmdline.length > 0) {
        // 行途中から選択開始されている場合、計算が面倒なので開始位置を行先頭へ移動する
        change_selection_start_column1();
        Editor.InsText(align(cmdline));
      }
      break;

    case 2:   // block selection
      var cmdline = get_cmdline();

      if(cmdline.length > 0) {
        Editor.InsBoxText(align(cmdline));
      }
      break;

    default:  // Ignored
      break;
  }
})();
