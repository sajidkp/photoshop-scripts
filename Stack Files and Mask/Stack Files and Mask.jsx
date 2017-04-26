#target photoshop  
/*******************************************
			Main Routine
*******************************************/
checkOpenFile();

var oldPref = app.preferences.rulerUnits 
app.preferences.rulerUnits = Units.PIXELS;  
var doc = activeDocument;  
var iLayer = doc.activeLayer;  

layerMask();
// Main Routine End
function layerMask()
{    
    layerDown ();  
    for(var i = app.activeDocument.layers.length - 2 ; i >=0 ; i--)
    { 
        doc.activeLayer = app.activeDocument.layers[i];
        iLayer = doc.activeLayer;  
        var mLayerB = app.activeDocument.layers[app.activeDocument.layers.length - 1].bounds;
        var scale = Math.max((mLayerB[2]-mLayerB[0])/(iLayer.bounds[2]-iLayer.bounds[0]),(mLayerB[3]-mLayerB[1])/(iLayer.bounds[3]-iLayer.bounds[1]));  
        iLayer.resize (scale*100,scale*100);  
        iLayer.translate((mLayerB[0]+mLayerB[2])/2-(iLayer.bounds[0]+iLayer.bounds[2])/2,(mLayerB[1]+mLayerB[3])/2-(iLayer.bounds[1]+iLayer.bounds[3])/2);  
        clip ();  
    }
    crop();
}


//Crop canvas to fit the mask
function crop()
{
	for (var i=0; i < app.activeDocument.layers.length - 1; i++ )
		createSmartObject(app.activeDocument.layers[i]);
	var bounds = app.activeDocument.layers[app.activeDocument.layers.length - 1].bounds;
	doc.crop(bounds);
    doc.resizeImage(undefined, undefined, 300, ResampleMethod.NONE );  
	app.activeDocument.layers[app.activeDocument.layers.length - 1].positionLocked = true;
    for (var i=0; i < app.activeDocument.layers.length - 1; i++ )
		rasterizeLayer(app.activeDocument.layers[i]);
}


//Convert to Smart Object
function createSmartObject(layer)
{	doc.activeLayer = layer;
    var idnewPlacedLayer = stringIDToTypeID( 'newPlacedLayer' );
    executeAction(idnewPlacedLayer, undefined, DialogModes.NO);
}

//Rasterize Layer
function rasterizeLayer(layer)
{
	doc.activeLayer = layer;
	executeAction(stringIDToTypeID('rasterizePlaced'), undefined, DialogModes.NO);
}
  
  function clip(){  
    var idGrpL = charIDToTypeID( "GrpL" );  
        var desc7 = new ActionDescriptor();  
        var idnull = charIDToTypeID( "null" );  
            var ref6 = new ActionReference();  
            var idLyr = charIDToTypeID( "Lyr " );  
            var idOrdn = charIDToTypeID( "Ordn" );  
            var idTrgt = charIDToTypeID( "Trgt" );  
            ref6.putEnumerated( idLyr, idOrdn, idTrgt );  
        desc7.putReference( idnull, ref6 );  
    executeAction( idGrpL, desc7, DialogModes.NO );  
    }
  
function layerDown(){  
    doc.activeLayer = app.activeDocument.layers.getByName("mask");
    doc.activeLayer.move(doc.layers[doc.layers.length-1],ElementPlacement.PLACEAFTER);
    
    var idslct = charIDToTypeID( "slct" );  
        var desc2 = new ActionDescriptor();  
        var idnull = charIDToTypeID( "null" );  
            var ref1 = new ActionReference();  
            var idLyr = charIDToTypeID( "Lyr " );  
            var idOrdn = charIDToTypeID( "Ordn" );  
            var idBckw = charIDToTypeID( "Bckw" );  
            ref1.putEnumerated( idLyr, idOrdn, idBckw );  
        desc2.putReference( idnull, ref1 );  
        var idMkVs = charIDToTypeID( "MkVs" );  
        desc2.putBoolean( idMkVs, false );  
        var idLyrI = charIDToTypeID( "LyrI" );  
            var list1 = new ActionList();  
            list1.putInteger( 3 );  
        desc2.putList( idLyrI, list1 );  
    executeAction( idslct, desc2, DialogModes.NO );  
    }

//Check if File is Open. Asks user if clipping need to be open on current File or open different files
function checkOpenFile(){
	if(app.documents.length == 0)
    {
            loadStack();
            return;
    }
		else	
             {
                if(!(confirm ("Do you want to apply masking on exiting document ? (Press no to open different set of images)")))
                    loadStack();
                else
                    return;
	}
}

// bring application forward for double-click events
app.bringToFront();

// loadFilesToStack - Function to load files to stack
function loadFilesToStack() {
	
	// user settings
	var prefs = new Object();
	prefs.sourceFolder         = '~';  // default browse location (default: '~')
	prefs.removeFileExtensions = true; // remove filename extensions for imported layers (default: true)
	prefs.savePrompt           = false; // display save prompt after import is complete (default: false)
	prefs.closeAfterSave       = false; // close import document after saving (default: false)

	// prompt for source folder
	var sourceFolder = Folder.selectDialog('Please select the folder to be imported:', Folder(prefs.sourceFolder));

	// ensure the source folder is valid
	if (!sourceFolder) {
		return;
	}
	else if (!sourceFolder.exists) {
		alert('Source folder not found.', 'Script Stopped', true);
		return;
	}

	// add source folder to user settings
	prefs.sourceFolder = sourceFolder;

	// get a list of files
	var fileArray = getFiles(prefs.sourceFolder);

	// if files were found, proceed with import
	if (fileArray.length) {
		importFolderAsLayers(fileArray, prefs);
	}
	// otherwise, diplay message
	else {
		alert("The selected folder doesn't contain any recognized images.", 'No Files Found', false);
	}
}


// getFiles - get all files within the specified source
function getFiles(sourceFolder) {
	// declare local variables
	var fileArray = new Array();
	var extRE = /\.(?:png|gif|jpg|bmp|tif)$/i;

	// get all files in source folder
	var docs = sourceFolder.getFiles();
	var len = docs.length;
	for (var i = 0; i < len; i++) {
		var adoc = docs[i];

		// only match files (not folders)
		if (adoc instanceof File) {
			// store all recognized files into an array
			var adocName = adoc.name;
			if (adocName.match(extRE)) {
				fileArray.push(adoc);
			}
		}
	}

	// return file array
	return fileArray;
}

// importFolderAsLayers - imports a folder of images as named layers
function importFolderAsLayers(fileArray, prefs) {
	// create a new document
	var newDoc = documents.add(300, 300, 72, prefs.sourceFolder.name, NewDocumentMode.RGB, DocumentFill.TRANSPARENT, 1);
	var newLayer = newDoc.activeLayer;

	// loop through all files in the source folder
	for (var i = 0; i < fileArray.length; i++) {
		// open document
		var adoc = open(fileArray[i]);

		// get document name (and remove file extension)
		var name = adoc.name;
		if (prefs.removeFileExtensions) {
			name = name.replace(/(?:\.[^.]*$|$)/, '');
		}

		// convert to RGB; convert to 8-bpc; merge visible
		adoc.changeMode(ChangeMode.RGB);
		adoc.bitsPerChannel = BitsPerChannelType.EIGHT;
		adoc.artLayers.add();
		adoc.mergeVisibleLayers();

		// rename layer; duplicate to new document
		var layer = adoc.activeLayer;
		layer.name = name;
		layer.duplicate(newDoc, ElementPlacement.PLACEATBEGINNING);

		// close imported document
		adoc.close(SaveOptions.DONOTSAVECHANGES);
	}	

	// delete empty layer; reveal and trim to fit all layers
	newLayer.remove();
	newDoc.revealAll();
	newDoc.trim(TrimType.TRANSPARENT, true, true, true, true);

	// save the final document
	if (prefs.savePrompt) {
		// PSD save options
		var saveOptions = new PhotoshopSaveOptions();
		saveOptions.layers = true;
		saveOptions.embedColorProfile = true;

		// prompt for save name and location
		var saveFile = File.saveDialog('Save the new document as:');
		if (saveFile) {
			newDoc.saveAs(saveFile, saveOptions, false, Extension.LOWERCASE);
		}

		// close import document
		if (prefs.closeAfterSave) {
			newDoc.close(SaveOptions.DONOTSAVECHANGES);
		}
	}
}

function loadStack()
{
// test initial conditions prior to running main function
if (isCorrectVersion()) {
	// remember ruler units; switch to pixels
	var originalRulerUnits = preferences.rulerUnits;
	preferences.rulerUnits = Units.PIXELS;

	try {
		loadFilesToStack();
	}
	catch(e) {
		// don't report error on user cancel
		if (e.number != 8007) {
			showError(e);
		}
	}

	// restore original ruler unit
	preferences.rulerUnits = originalRulerUnits;
}
}

// isCorrectVersion - check for Adobe Photoshop CS2 (v9) or higher
function isCorrectVersion() {
	if (parseInt(version, 10) >= 9) {
		return true;
	}
	else {
		alert('This script requires Adobe Photoshop CS2 or higher.', 'Wrong Version', false);
		return false;
	}
}

// showError - display error message if something goes wrong
function showError(err) {
	if (confirm('An unknown error has occurred.\n' +
		'Would you like to see more information?', true, 'Unknown Error')) {
			alert(err + ': on line ' + err.line, 'Script Error', true);
	}
}

