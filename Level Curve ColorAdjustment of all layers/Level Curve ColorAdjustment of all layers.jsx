

/***********************************************************
                  Function Definitions
***********************************************************/
var status  = 1;

//Check if any Open Files Present. If not files present, open file
function checkOpenFile(){
	if(app.documents.length == 0){
		if(confirm("No open document. Do you want to open a file?"))
			var file = File.openDialog("Choose a File:");
		else	
			status = 0;
			return 0;
		if (file)
			open(file);
		else	
		{
			status = 0;
			return 0;
		}
		status = 1;
		return 1;
	}
}

//Main function for adjustments
function adjustLevelCurveColor(){
	var visibleLayers = new Array();
	var index = 0;
	//Loops through layers and apply effects
	for(var i = 0 ; i < app.activeDocument.layers.length; i++)
	{
		if (app.activeDocument.layers[i].visible == 0)
		{
			if (i < (app.activeDocument.layers.length - 1))
			{
				continue;
			}
			else
				break;
		}
		else
		{
			app.activeDocument.activeLayer = app.activeDocument.layers[i];
			visibleLayers[index] = i;
			index++;
			if(app.activeDocument.activeLayer.kind == LayerKind.TEXT)
				continue;
			if (app.activeDocument.activeLayer.positionLocked)
				continue;
		}
		
		try {  
		var idCrvs = charIDToTypeID( "Lvls" );  
		executeAction( idCrvs, undefined, DialogModes.ALL );  
		}   
		catch (e) {};  
		try {  
		var idCrvs = charIDToTypeID( "Crvs" );  
		executeAction( idCrvs, undefined, DialogModes.ALL );  
		}   
		catch (e) {};  
		try {  
		var idCrvs = charIDToTypeID( "ClrB" );  
		executeAction( idCrvs, undefined, DialogModes.ALL );  
		}   	
		catch (e) {};  
		app.activeDocument.activeLayer.visible = 0;
	}
	//Handle case when all layers are hidden in the document
	if (index == 0)
	{
		alert("No Visible Layers.");
		status = 0;
		return 0;
	}
	//Unhide temporarily hidden layers
	for(var i = 0 ; i < app.activeDocument.layers.length   ;i++)
	{
		for(var j = 0 ; j < index   ;j++)
		{
			if(visibleLayers[j] == i)
			{
				app.activeDocument.activeLayer = app.activeDocument.layers[i];
				app.activeDocument.activeLayer.visible = 1;
				break;
			}
		}
	}
	status = 1;
	return 1;
}


/***********************************************************
                  Main Routine
***********************************************************/
checkOpenFile();
if (status == 1)
	adjustLevelCurveColor();
