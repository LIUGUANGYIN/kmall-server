(function($){
	  $('.btn-remove').on('click',function(){
	  	$(this.parentNode).remove();
	  })

	  $('.btn-add').on('click',function(){
	  	var $this=$(this);
	  	var $dom=$this.siblings().eq(0).clone(true);
	  	$dom.find('type="text"').val('');
	  	$this.append($dom);
	  })
	
})(jQuery);