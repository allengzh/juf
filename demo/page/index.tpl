<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Smarty</title>
    <script type="text/javascript" src="/static/index/js/do.js"></script>
    <script type="text/javascript" src="/static/index/js/jquery.min.js"></script>
    <link rel="stylesheet" type="text/css" href="/static/index/css/do.less">
</head>
<body>
    <div class="content">This is the smarty demo. The HTML doc is based on the origin page from the the webpack's compilinag.
    <{$abc}>66ssdd</div>
    <img src="/static/index/img/wap_book_5.png">
    <script>
    	$.ajax({
    		type: 'get',
    		url: '/asample',
    		success: function (data) {
    			console.log(data.aaa+'aa');
    		}
    	})
    </script>
    <{include file='widget/bar/bar.tpl'}>
</body>
</html>