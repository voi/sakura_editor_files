// grep_keta_soroe.js
(function(){
	var auto_detect = false;
	var topLine = 1;
	{
		var lineMaxCount = Editor.GetLineCount(0);
		var lineNum = lineMaxCount;
		for(lineMaxCount; 0 < lineNum; lineNum-- ){
			var lineStr = Editor.GetLineStr(lineNum);
			if( lineStr.substr(0, 8) == "□検索条件  \"" ){
				topLine = lineNum;
				break;
			}
		}
	}
	var grep_lines = function( func, func_begin, func_end ){
		var lineCount = Editor.GetLineCount(0);
		var lineNum = topLine;
		var mode = 0;
		for( ; lineNum <= lineCount; lineNum++ ){
			var lineStr = Editor.GetLineStr(lineNum);
			if( mode == 0 ){
				if( lineStr.substr(0, 8) == "□検索条件  \"" ){
					mode = 1;
				}
				continue;
			}else if( mode == 1 ){
				if( lineStr == "\r\n" ){
					mode = 2;
				}
				if( lineStr == "    (文字コードセットの自動判別)\r\n" ){
					auto_detect = true;
				}
				continue;
			}else if( mode == 2 ){
				if( lineStr != "\r\n" ){
					mode = 3;
					func_begin(lineNum, lineStr);
				}else{
					continue;
				}
			}
			if( /^\d+ 個が検索されました。/.test(lineStr) ){
				func_end(lineNum);
				break;
			}else{
				func(lineNum, lineStr);
			}
		}
	};
	var max_path = 0;
	var regex_str1 = /^(([A-Z]:|\\\\|・)[^\?\*:]+\(\d+,\d+\)  \[\w+\]:)/;
	var regex_str2 = /^(([A-Z]:|\\\\|・)[^\?\*:]+\(\d+,\d+\):)/;
	grep_lines( function( lineNum, lineStr ){
			var regex;
			if( auto_detect ){
				regex = regex_str1;
			}else{
				regex = regex_str2;
			}
			var ret = regex.exec(lineStr);
			if( ret != null ){
				var tag = ret[0];
				var width = Editor.GetStrLayoutLength(tag);
				if( max_path < width ){
					max_path = width;
				}
			}
		},
		function( lineNum, lineStr ){},
		function( lineNum ){}
	);
	var retStr = "";
	grep_lines( function( lineNum, lineStr ){
			var regex;
			if( auto_detect ){
				regex = regex_str1;
			}else{
				regex = regex_str2;
			}
			var ret = regex.exec(lineStr);
			if( ret != null ){
				var tag = ret[0];
				var buf = "";
				var sp_width = Editor.GetStrLayoutLength(" ");
				var i = Editor.GetStrLayoutLength(tag);
				for( ; i < max_path; i+=sp_width ){
					buf += " ";
				}
				retStr += lineStr.substr(0, tag.length -1) + buf + lineStr.substr(tag.length -1);
			}else{
				retStr += lineStr;
			}
		},
		function( lineNum, lineStr ){},
		function( lineNum ){}
	);
	grep_lines( function( lineNum, lineStr ){},
		function( lineNum, lineStr ){ Editor.MoveCursor(lineNum, 1, 0); },
		function( lineNum ){
			Editor.MoveCursor(lineNum, 1, 1);
			Editor.InsText(retStr);
		}
	);
})();
