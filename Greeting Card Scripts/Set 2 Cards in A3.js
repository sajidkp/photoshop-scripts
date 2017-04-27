/**************************************************************
	Aligns A4 sized Greeting cards to  fit the 
	A3 canvas
	Requirements:
	The greeting card layers need to be named as follows:
	Front Sides: "rightBottom"  and 	"rightTop"
	Back Sides : "bottom"		and		"top"
*****************************************************************/

/*Global Varriables*/
var fileOpenStatus = 0;
app.preferences.rulerUnits = Units.PIXELS;
var actLayer;
var bounds;
var doc;

/*********************************
		Main Routine
*********************************/		
checkOpenFile();
if(fileOpenStatus == 1)
{
	doc = app.activeDocument;
	greetingCardAlign();
}

// Main Routine End

//Aligns the greeting card into A3 Size paper area after resizeing it
function greetingCardAlign()
{
    var layersFound = 0;
    for(var i = 0 ; i < doc.layers.length  ; i++)
	{	
		app.activeDocument.activeLayer = doc.layers[i];
		switch (doc.layers[i].name)
		{
			case "rightTop": rightTop(doc.layers[i]); layersFound++;
			break;
			case "rightBottom": rightBottom(doc.layers[i]); layersFound++;
			break;
			case "top": top(doc.layers[i]); layersFound++;
			break;
			case "bottom": bottom(doc.layers[i]); layersFound++;
			break;
			default: 
                break;
		}
	}
    if (layersFound <4)
    {
            alert("Layer Missing. Please make surefollowing name convention is used:\nFront sides are name 'rightTop' and 'rightBottom'\nBack sides are name 'top' and 'bottom'",'Layer not found');
            return 0;
    }
    saveFile();
    alert("The Greeting cards have been saved successfully in GCPRINT at desktop. Closing the document", 'Files Saved.');
	doc.close(SaveOptions.DONOTSAVECHANGES);
}

//Position at right top
function rightTop(activeLayer)
{
	actLayer = activeLayer;
	bounds = actLayer.bounds;
	moveToCenter();
	resize();
	var dX= actLayer.bounds[0] - 0 ; //Grab the width
	var dY= actLayer.bounds[1] - doc.height/2 ; //Grab the height
	app.activeDocument.activeLayer.translate(dX, dY);
}

// Position at right bottom
function rightBottom(activeLayer)
{
	actLayer = activeLayer;
	bounds = actLayer.bounds;
	moveToCenter();
	resize();
	var dX = doc.width/2 - actLayer.bounds[0]; // Grab Width
	var dY = doc.height/2- actLayer.bounds[1]; //Grab Height
	app.activeDocument.activeLayer.translate(dX, dY);
}

// Position at top
function top(activeLayer)
{
	actLayer = activeLayer;
	bounds = actLayer.bounds;
	moveToCenter();
    resize();
	var dX = actLayer.bounds[0]   ; //Grab the length
	var dY = -1 * actLayer.bounds[1]  ; //Grab the width
	app.activeDocument.activeLayer.translate(dX, dY);
}

// Position at bottom
function bottom(activeLayer)
{
	actLayer = activeLayer;
	bounds = actLayer.bounds;
	moveToCenter();
    resize();
	var dX = actLayer.bounds[0] - 0 ; //Grab the length
	var dY = actLayer.bounds[1] - 0 ; //Grab the width
	app.activeDocument.activeLayer.translate(dX, dY);
}

//Moves the active layer to center of document
function moveToCenter()
{
	
	var Hoffset = (app.activeDocument.width - app.activeDocument.width) / 2;
	var Voffset = (app.activeDocument.height - app.activeDocumentheight) / 2;
	app.activeDocument.activeLayer.position = Array(Hoffset, Voffset);
    actLayer = app.activeDocument.activeLayer;
	// get doc dimensions
	// BUG: both width and height will be off by +2 px for shape layers
	// NOTE: layers with styles might not be centered correctly
	var docWidth = Number(doc.width);
	var docHeight = Number(doc.height);

	// get layer dimensions
	var layerWidth = Number(bounds[2] - bounds[0]);
	var layerHeight = Number(bounds[3] - bounds[1]);

	//Calculate offset
	var dX = (docWidth - layerWidth) / 2 - Number(bounds[0]);
	var dY = (docHeight - layerHeight) / 2 - Number(bounds[1]);
	actLayer.translate(dX, dY);	
	
}

//Resizes the Greeting Card to fit A3 Half page
function resize()
{
        app.preferences.rulerUnits = Units.PERCENT;    
	var percentageWidth = 70.72;
	percentageHeight = 70.72    ;
	app.activeDocument.activeLayer.resize(percentageWidth,percentageHeight,AnchorPosition.MIDDLECENTER);
	app.preferences.rulerUnits = Units.PIXELS;
}

//Checks if a file is open
function checkOpenFile(){
	if(app.documents.length == 0)
	{
		alert("No Document Open. Run the script when a file is open", 'No File Open');
		fileOpenStatus = 0;
		return 0;
	}
	else
	{
		fileOpenStatus = 1;
		return 1;
	}
}

function saveFile()
{
    var imgName= prompt("Provide the File Name:", "File Name");
    for(var i = 0 ; i < doc.layers.length  ; i++)
        {	
            app.activeDocument.activeLayer = doc.layers[i];
            actLayer = app.activeDocument.activeLayer;
		switch (doc.layers[i].name)
        {
            case "rightTop":  actLayer.visible = 1;
            break;
            case "rightBottom": actLayer.visible = 1;
            break;
            case "top": actLayer.visible = 0
            break;
            case "bottom": actLayer.visible = 0;
            break;
            default: 
            break;
		}
    
	}
    var front =  imgName + ' Front';
    savePdf (front);
    for(var i = 0 ; i < doc.layers.length  ; i++)
	{	
        app.activeDocument.activeLayer = doc.layers[i];
        actLayer = app.activeDocument.activeLayer;
        switch (doc.layers[i].name)
		{
			case "rightTop":  actLayer.visible = 0;
			break;
			case "rightBottom": actLayer.visible = 0;
			break;
			case "top": actLayer.visible = 1;
			break;
			case "bottom": actLayer.visible = 1;
			break;
			default: 
                break;
		}
	}
    var back  = imgName + ' Back';
    savePdf (back);
}


function savePdf(fileName)
{
 
 // Save Options for PDFs
pdfFile = new File( 'C:/Users/Wisholize/Desktop/GC PRINT'+'/' + fileName + ".pdf")
pdfSaveOptions = new PDFSaveOptions()
pdfSaveOptions.PDFCompatibility = PDFCompatibility.PDF16;
pdfSaveOptions.colorConversion = false;
pdfSaveOptions.destinationProfile = "U.S. Web Coated (SWOP) v2";
pdfSaveOptions.embedColorProfile = false;
pdfSaveOptions.optimizeForWeb = true;
pdfSaveOptions.profileInclusionPolicy = false;
pdfSaveOptions.encoding = PDFEncoding.JPEG;
pdfSaveOptions.downSample = PDFResample.PDFBICUBIC;
 
// set to NONE to allow PDF Security Options. Permission is for Printing only. A common password
// needs to be added as soon as the file is saved without typing it in all the time
pdfSaveOptions.PDFStandard = PDFStandard.NONE;
 
pdfSaveOptions.downSampleSize = 200;
pdfSaveOptions.downSampleSizeLimit = 250;
pdfSaveOptions.layers = false;
pdfSaveOptions.preserveEditing=false;
pdfSaveOptions.jpegQuality = 10;
doc.saveAs(pdfFile, pdfSaveOptions, true, Extension.LOWERCASE);


}