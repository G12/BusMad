var SurealRanch_Controls = (function()
{
	function Form(map, shadow_id, control_position /*google.maps.ControlPosition*/,document_height, document_width)
	{
		this.document_height = document_height;
		this.document_width = document_width;
		this.expanded = false;
		this.contentHtml = "";
		this.set('map',map);
		this.div = document.createElement('div');
		this.div.style.padding = '10px';

		this.shadow = document.createElement('div');
		this.shadow.style.backgroundImage="url('Shadow.png')";
		this.shadow.style.backgroundRepeat = 'no-repeat';
		this.shadow.style.paddingRight = '10px';
		this.shadow.style.paddingBottom = '10px';
		this.shadow.style.marginTop = '10px';
		this.shadow.style.marginLeft = '10px';
		this.shadow.style.backgroundSize = '100%';
		
		this.border = document.createElement('div');
		this.border.style.backgroundColor = 'white';
		this.border.style.borderStyle = 'solid';
		this.border.style.width = '290px'

		var table = document.createElement('table');
		var row = document.createElement('tr');
		this.arrow_button = document.createElement('td');
		
		this.tab1 = document.createElement('td');
		this.tab1.id = 'TabOne';
		this.tab1.style.borderStyle = 'solid';
		//this.tab1.innerHTML = '<a href="#" title="Some Tab Information Here"><b>H:' + this.document_height + ' W:' + this.document_width + '</b></a>'; 
		this.tab1.innerHTML = '<a href="#" title="Turn Text Mode On or Off"><b>Object Mode</b></a>'; 
		
		this.status = document.createElement('td');

		row.appendChild(this.arrow_button);
		row.appendChild(this.tab1);
		row.appendChild(this.status);
		table.appendChild(row);
		
		header = document.createElement('div');
		header.style.padding = '10px';
		header.style.fontFamily = 'Arial, Helvetica, sans-serif';

		header.appendChild(table);
		
		this.content = document.createElement('div');
		this.content.style.padding = '10px';
		this.content.style.fontFamily = 'Arial, Helvetica, sans-serif';
		this.content.style.overflow = 'auto';
		this.content.style.maxHeight = '600px';

		this.border.appendChild(header);
		this.border.appendChild(this.content);

		this.shadow.appendChild(this.border);
		this.div.appendChild(this.shadow);
		
		//this.shadow.style.backgroundSize = '100%';

		map.controls[control_position].push(this.div);
		this.open = true;

		var self = this
		// Setup the click event listener
		google.maps.event.addDomListener(this.arrow_button, 'click', function() {
			self.toggleContent();
		});
		
		google.maps.event.addDomListener(this.tab1, 'click', function() {
			var str = this.id + '_clicked';
			google.maps.event.trigger(self, str, this);
		});

	}

	Form.prototype = new google.maps.MVCObject;
	
	Form.prototype.setStatus = function(str)
	{
		this.status.innerHTML = str;
	}

	Form.prototype.setContent = function(str)
	{
		this.contentHtml = str;
		this.content.innerHTML = str;
		var max = this.document_height - 32;
		if(this.content.height > max)
		{
			this.content.style.overflow = 'scroll';
		}
		this.content.height = 'auto';
		this.expanded = true;
		this.arrow_button.innerHTML = '<a href="#"><img alt="close" src="img/up.png"/></a>';
	}

	Form.prototype.openForm = function()
	{
		this.div.style.visibility = 'visible';
		this.open = true;
	}

	Form.prototype.closeForm = function()
	{
		this.div.style.visibility = 'hidden';
		this.open = false;
	}

	Form.prototype.toggleContent = function()
	{
		if(this.expanded)
		{
			this.contentHtml = this.content.innerHTML;
			this.content.innerHTML = "";
			this.content.height = '0px';
			this.arrow_button.innerHTML = '<a href="#"><img alt="close" src="img/down.png"/></a>';
			
			//take scroll bars off when minimized
			this.content.style.overflow = 'auto';
		}
		else
		{
			this.content.innerHTML = this.contentHtml;
			this.content.height = 'auto';
			this.arrow_button.innerHTML = '<a href="#"><img alt="close" src="img/up.png"/></a>';
		}
		this.expanded = !this.expanded;
	}
	
	return {Form: Form};
})();