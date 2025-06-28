import { ClassElement } from './ClassElement.js';
import { Attribute } from './Attribute.js';
import { Method, Parameter } from './Method.js';
import { Cardinality } from './Cardinality.js';
import { Relation } from './Relation.js';

let selectedClassElement = null;
let selectedClassDiv = null;
let classesUML = {};

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('addClassButton').addEventListener('click', () => {
    let className = prompt("Nom de votre Classe:");
    while (isClassNameTaken(className)) {
      alert("Ce nom de classe est déjà pris. Veuillez en choisir un autre.");
      className = prompt("Nom de votre Classe:");
    }
    
    if (className) {
      createClassElement(className);
    }
  });
  function onClassCreated(className) {
    // Ajouter une nouvelle entrée à classesUML lors de la création d'une classe
    classesUML[className] = { attributs: {}, methodes: {} };
  }


  document.getElementById('addAttributeButton').addEventListener('click', () => {
    addAttributeToClass();
  });


  document.getElementById('editAttributesButton').addEventListener('click', () => {
    editAttributes();
  });

  document.getElementById('deleteAttributeButton').addEventListener('click', () => {
    deleteAttribute();
});

document.getElementById('generateCodeButton').addEventListener('click', () => {
  collectClassData();
  generateAndDownloadJavaFile();
});



});
document.addEventListener('DOMContentLoaded', () => {
  const addRelationButton = document.getElementById('addRelationButton');
  addRelationButton.addEventListener('click', initiateRelationCreation);
});

/*========================Creation de la partie graphique [Claase et Positionnement] [DEBUT]=================================*/

//-- `isClassNameTaken(name)`: Cette fonction vérifie si un élément avec le même nom de classe existe déjà dans le document en utilisant document.querySelector.
//-- Elle cherche un élément avec la classe spécifiée et retourne true si elle en trouve un, sinon false.

function isClassNameTaken(name) {
  // Vérifiez si un élément avec le même nom de classe existe déjà
  const existingClassElement = document.querySelector(`.class-element[data-name="${name}"]`); //data-name pour stocker la classe
  return !!existingClassElement;
}


function createClassElement(className) {
  const classElement = new ClassElement(className);
  const classDiv = document.createElement('div');
  classDiv.className = 'class-element';
  classDiv.dataset.name = className; // Utilisé pour identifier l'élément
  classDiv.textContent = `${className}`;
  classDiv.style.position = 'absolute';
  classDiv.style.left = '50px';
  classDiv.style.top = '50px';
  classDiv.classList.add('text-center');
  
  //un gestionnaire d'événements onclick pour sélectionner l'élément de classe lorsqu'il est cliqué.
  classDiv.onclick = () => selectClassElement(classElement, classDiv); 
  document.getElementById('drawingArea').appendChild(classDiv);
  
  //Pour permettre le déplacement de l'élément. 
  makeElementDraggable(classDiv);
}


//La fonction [makeElementDraggable] rend l'élément passé en paramètre (représentant une classe) draggable.
//Elle utilise les événements mousedown, mousemove, et mouseup pour suivre et mettre à jour la position de l'élément lorsqu'il est déplacé par la souris.
function makeElementDraggable(element) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  // Appel de la fonction dragMouseDown qui permet à l'utilisateur de se déplacer
  element.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  // La fonction elementDrag ajuste les coordonnées de l'élément en fonction du mouvement de la souris
  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();

    // Calcul du déplacement par rapport à la position initiale de l'élément
    let newX = e.clientX - pos3;
    let newY = e.clientY - pos4;

    // Mise à jour des positions pour le prochain déplacement
    pos3 = e.clientX;
    pos4 = e.clientY;

    // Ajustement de la position de l'élément en fonction du déplacement
    element.style.top = (element.offsetTop + newY) + "px";
    element.style.left = (element.offsetLeft + newX) + "px";
  }

  // La fonction closeDragElement est appelée pour arrêter de suivre le mouvement de la souris et mettre à jour les relations de la classe.
  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
    updateClassRelations(element.dataset.name);
  }
}



/*========================Creation de la partie graphique [Claase et Positionnement] [FIN]=================================*/




//======= SUPPRESSION D'UNE CLASSE=============//

document.getElementById('deleteClassButton').addEventListener('click', () => {
  //Verification si une classe est séléctionné
  if (selectedClassElement) {
    const isConfirmed = confirm(`Voulez-vous vraiment supprimer la classe ${selectedClassElement.name} ?`);

    //Si confirmation est accordé par user pour supprimer la clase
    if (isConfirmed) {
      deleteClassElement(selectedClassElement, selectedClassDiv);
    }

  } else {
    alert("Veuillez sélectionner une classe d'abord.");
  }
});


function deleteClassElement(classElement, classDiv) {
  // Supprimer l'élément du DOM
  classDiv.remove();

  // Supprimer toutes les relations associées à cette classe
  deleteRelatedRelations(classElement.name);

  // Réinitialisation des éléments sélectionnés
  selectedClassElement = null;
  selectedClassDiv = null;
}


//======= FIN SUPPRESSION D'UNE CLASSE=============//














// =========================================== # RELATION # ========================================================//

let relationIdCounter = 0;
let classRelations = {};

// Fonction pour initier la création de la relation
function initiateRelationCreation() {
  const fromClassName = prompt("Entrez le nom de la classe de départ:");
  const toClassName = prompt("Entrez le nom de la classe d'arrivée:");

  const fromClassElement = document.querySelector(`.class-element[data-name="${fromClassName}"]`);
  const toClassElement = document.querySelector(`.class-element[data-name="${toClassName}"]`);

  if (!fromClassElement || !toClassElement) {
    alert("Les classes doivent exister pour créer une relation.");
    return;
  }

  const relationTypeOptions = [
    "1- Association",
    "2- Héritage",
    "3- Agrégation",
    "4- Composition",
    "5- Dépendance"
  ];
  
  function askForRelationType() {
    // Créer une chaîne de caractères avec les options numérotées
    const relationTypePrompt = relationTypeOptions.join("\n");
  
    // Afficher le prompt avec les options
    const selectedRelationTypeIndex = prompt(`Choisir le type de relation :\n${relationTypePrompt}`, "1");
  
    // Extraire la valeur de type de relation en fonction de la sélection
    const selectedRelationType = relationTypeOptions.find(option => option.startsWith(selectedRelationTypeIndex))?.split("- ")[1];
  
    if (selectedRelationType) {
      return selectedRelationType;
    } else {
      alert("Choix non valide. Veuillez choisir parmi les options disponibles.");
      return askForRelationType(); // Rappeler la fonction si le choix n'est pas valide
    }
  }


  // Liste des options de cardinalité
  const cardinalityOptions = [
    "1- 1..1",
    "2- 1..n",
    "3- n..1",
    "4- n..n"
  ];

  function askForCardinality(cardinalityType) {
    // Créer une chaîne de caractères avec les options numérotées
    const cardinalityPrompt = cardinalityOptions.join("\n");
  
    // Modifier le message du prompt en fonction du type de cardinalité
    const promptMessage = cardinalityType === 'from' 
      ? `Choisir les cardinalités pour la classe de départ :\n${cardinalityPrompt}`
      : `Choisir les cardinalités pour la classe d'arrivée :\n${cardinalityPrompt}`;
  
    // Afficher le prompt avec les options
    const selectedCardinalityIndex = prompt(promptMessage, "1");
  
    // Extraire la valeur de cardinalité en fonction de la sélection
    const selectedCardinality = cardinalityOptions.find(option => option.startsWith(selectedCardinalityIndex))?.split("- ")[1];
  
    if (selectedCardinality) {
      return selectedCardinality;
    } else {
      alert("Choix non valide. Veuillez choisir parmi les options disponibles.");
      return askForCardinality(cardinalityType); // Rappeler la fonction si le choix n'est pas valide
    }
  }
  
  // Appeler la fonction pour la classe de départ et d'arrivée
  const cardinalityFrom = askForCardinality('from');
  const cardinalityTo = askForCardinality('to');
  const relationType = askForRelationType();

  drawRelation(fromClassElement, toClassElement, relationType, cardinalityFrom, cardinalityTo);
}


// Fonction pour créer une ligne SVG entre deux éléments HTML
function createSvgLine(fromElement, toElement) {

  const svgNamespace = "http://www.w3.org/2000/svg";
  const svgLine = document.createElementNS(svgNamespace, 'line');
  
  // Définir les coordonnées de départ et d'arrivée
  const fromRect = fromElement.getBoundingClientRect();
  const toRect = toElement.getBoundingClientRect();
  
  const fromX = fromRect.left + fromRect.width / 2;
  const fromY = fromRect.top + fromRect.height / 2;
  
  const toX = toRect.left + toRect.width / 2;
  const toY = toRect.top + toRect.height / 2;

  // Définir les attributs de la ligne SVG
  svgLine.setAttribute('x1', fromX);
  svgLine.setAttribute('y1', fromY);
  svgLine.setAttribute('x2', toX);
  svgLine.setAttribute('y2', toY);
  svgLine.setAttribute('stroke', 'black'); // Couleur de la ligne
  svgLine.setAttribute('stroke-width', '2'); // Épaisseur de la ligne

  return svgLine;

}


function drawRelation(fromClassElement, toClassElement, relationType, cardinalityFrom, cardinalityTo) {
  const svgContainer = document.getElementById('svgContainer') || createSvgContainer();
  const newLine = createSvgLine(fromClassElement, toClassElement);

  if (relationType === 'Héritage') {
    const marker = createSvgTriangleMarker(svgContainer);
    newLine.setAttribute('marker-end', `url(#${marker.id})`);
  } else if (relationType === 'Agrégation') {
    const marker = createSvgDiamondMarker(svgContainer);
    newLine.setAttribute('marker-end', `url(#${marker.id})`);
  } else if (relationType == 'Composition'){
    const marker = createSvgDiamondMarkerComp(svgContainer);
    newLine.setAttribute('marker-end', `url(#${marker.id})`);
  }else if (relationType === 'Dépendance') {
    const marker = createSvgArrowMarker(svgContainer);
    newLine.setAttribute('marker-end', `url(#${marker.id})`);
}


  const relationId = `relation-${relationIdCounter++}`;
  newLine.id = relationId;

  // Générer les identifiants pour les textes de cardinalité
  const cardinalityFromId = `card-from-${relationId}`;
  const cardinalityToId = `card-to-${relationId}`;

  // Créer les textes de cardinalité
  const cardinalityFromText = createSvgText(cardinalityFrom, newLine.getAttribute('x1'), newLine.getAttribute('y1'), cardinalityFromId);
  const cardinalityToText = createSvgText(cardinalityTo, newLine.getAttribute('x2'), newLine.getAttribute('y2'), cardinalityToId);

  newLine.setAttribute('data-source', fromClassElement.dataset.name);
  newLine.setAttribute('data-destination', toClassElement.dataset.name);

 
  storeClassRelation(fromClassElement.dataset.name, relationId, cardinalityFromId, cardinalityToId);
  storeClassRelation(toClassElement.dataset.name, relationId, cardinalityFromId, cardinalityToId);


  svgContainer.appendChild(newLine);
  svgContainer.appendChild(cardinalityFromText);
  svgContainer.appendChild(cardinalityToText);
}


function storeClassRelation(className, relationId, cardFromId, cardToId) {
  if (!classRelations[className]) {
    classRelations[className] = [];
  }
  classRelations[className].push({ relationId, cardFromId, cardToId });
  console.log(`Storing relation for ${className}: ${relationId}, ${cardFromId}, ${cardToId}`);
}




function updateClassRelations(className) {
  const classDiv = document.querySelector(`.class-element[data-name="${className}"]`);
  if (!classDiv) return; // S'assurer que l'élément de classe existe

  const classRect = classDiv.getBoundingClientRect();

  // Vérifier si les relations pour cette classe existent avant de les parcourir
  if (classRelations[className]) {
    classRelations[className].forEach(({ relationId, cardFromId, cardToId }) => {
      const line = document.getElementById(relationId);
      const isSource = line && line.getAttribute('data-source') === className;
      const isDestination = line && line.getAttribute('data-destination') === className;

      if (line && (isSource || isDestination)) {
        updateSvgLinePosition(line, classDiv, classRect, isSource);
      }

      if (isSource) {
        const cardFromText = document.getElementById(cardFromId);
        if (cardFromText) updateSvgTextPosition(cardFromText, classRect, 'from');
      }

      if (isDestination) {
        const cardToText = document.getElementById(cardToId);
        if (cardToText) updateSvgTextPosition(cardToText, classRect, 'to');
      }
    });
  }
}



function updateSvgLinePosition(line, classDiv, classRect, isSource) {
  // Définissez les marges pour éloigner la ligne des bords des éléments de classe
  const marginX = 6; // Décalage horizontal
  const marginY = 6; // Décalage vertical

  let x, y;

  if (isSource) {
    // Partir de la marge de gauche pour la classe de départ
    x = classRect.left - marginX;
    y = classRect.top + classRect.height / 2; // Centrer verticalement
  } else {
    // Partir de la marge de droite pour la classe d'arrivée
    x = classRect.right + marginX;
    y = classRect.top + classRect.height / 2; // Centrer verticalement
  }

  // Ajuster l'extrémité de la ligne correspondante
  line.setAttribute(isSource ? 'x1' : 'x2', x);
  line.setAttribute(isSource ? 'y1' : 'y2', y);
}


function updateSvgTextPosition(textElement, classRect, position) {
  // Définissez le décalage désiré ici
  const offsetX = 10; // Décalage horizontal
  const offsetY = -5; // Décalage vertical (négatif pour déplacer vers le haut)

  let x, y;

  if (position === 'from') {
    // Placer le texte de cardinalité près du coin supérieur gauche de la classe de départ
    x = classRect.left - offsetX;
    y = classRect.top + offsetY;
  } else { // 'to'
    // Placer le texte de cardinalité près du coin supérieur droit de la classe d'arrivée
    x = classRect.right + offsetX;
    y = classRect.top + offsetY;
  }

  textElement.setAttribute('x', x);
  textElement.setAttribute('y', y);
}



// Fonction pour créer un texte SVG
function createSvgText(textContent, x, y, id) {
  const svgNamespace = "http://www.w3.org/2000/svg";
  const textElement = document.createElementNS("http://www.w3.org/2000/svg", 'text');
  textElement.setAttribute('x', x);
  textElement.setAttribute('y', y);
  textElement.textContent = textContent;
  textElement.id = id;
  textElement.setAttribute('fill', 'black'); // Couleur du texte
  textElement.setAttribute('font-size', '12'); // Taille du texte
  textElement.setAttribute('font-family', 'Arial, sans-serif'); // Police du texte
  textElement.setAttribute('text-anchor', 'middle'); // Alignement du texte
  textElement.setAttribute('dy', '-5px'); // Décalage pour ne pas superposer la ligne

  return textElement;
}


//===== Fonction pour créer un triangle SVG (cas d'héritage)
function createSvgTriangleMarker(svgContainer) {
  const defs = svgContainer.querySelector('defs') || createSvgDefs(svgContainer);
  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
  const triangle = document.createElementNS('http://www.w3.org/2000/svg', 'path');

  // Configurer les propriétés du marqueur triangle
  marker.setAttribute('id', 'triangle-marker');
  marker.setAttribute('viewBox', '0 0 13 13');
  marker.setAttribute('refX', '10');
  marker.setAttribute('refY', '5');
  marker.setAttribute('markerUnits', 'strokeWidth');
  marker.setAttribute('markerWidth', '10');
  marker.setAttribute('markerHeight', '10');
  marker.setAttribute('orient', 'auto');

  // Configurer les propriétés du triangle
  triangle.setAttribute('d', 'M 1 1 L 11 6 L 1 11 z'); // Coordonnées pour un triangle
  triangle.setAttribute('fill', 'none');
  triangle.setAttribute('stroke', 'black'); // Contour noir
  triangle.setAttribute('stroke-width', '1'); // Largeur du contour


  // Ajouter le triangle au marqueur et le marqueur aux définitions
  marker.appendChild(triangle);
  defs.appendChild(marker);

  return marker;
}

  // Configurer les propriétés du marqueur Losange pour Agrégation
  function createSvgDiamondMarker(svgContainer) {
    const defs = svgContainer.querySelector('defs') || createSvgDefs(svgContainer);
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    const diamond = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  
    // Configurer les propriétés du marqueur
    marker.setAttribute('id', 'diamond-marker-agregation');
    marker.setAttribute('viewBox', '0 0 11 11');
    marker.setAttribute('refX', '10');
    marker.setAttribute('refY', '5');
    marker.setAttribute('markerUnits', 'strokeWidth');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '10');
    marker.setAttribute('orient', 'auto');
  
    // Configurer les propriétés du losange
    diamond.setAttribute('d', 'M 5 1 L 9 5 L 5 9 L 1 5 Z'); // Coordonnées pour un losange
    diamond.setAttribute('fill', 'none');
    diamond.setAttribute('stroke', 'black');
  
    // Ajouter le losange au marqueur et le marqueur aux définitions
    marker.appendChild(diamond);
    defs.appendChild(marker);
  
    return marker;
  }
  


  // Configurer les propriétés du marqueur Losange remplie pour Composition
  function createSvgDiamondMarkerComp(svgContainer) {
    const defs = svgContainer.querySelector('defs') || createSvgDefs(svgContainer);
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    const diamond = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  
    // Configurer les propriétés du marqueur
    marker.setAttribute('id', 'diamond-marker-composition');
    marker.setAttribute('viewBox', '0 0 11 11');
    marker.setAttribute('refX', '10');
    marker.setAttribute('refY', '5');
    marker.setAttribute('markerUnits', 'strokeWidth');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '10');
    marker.setAttribute('orient', 'auto');
  
    // Configurer les propriétés du losange
    diamond.setAttribute('d', 'M 5 1 L 9 5 L 5 9 L 1 5 Z'); // Coordonnées pour un losange
    diamond.setAttribute('fill', 'black');
    diamond.setAttribute('stroke', 'black');
  
    // Ajouter le losange au marqueur et le marqueur aux définitions
    marker.appendChild(diamond);
    defs.appendChild(marker);
  
    return marker;
  }



  // Configurer les propriétés du marqueur Arrow  pour Dépendance

  function createSvgArrowMarker(svgContainer) {
    const defs = svgContainer.querySelector('defs') || createSvgDefs(svgContainer);
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    // Configurer les propriétés du marqueur
    marker.setAttribute('id', 'arrow-marker');
    marker.setAttribute('viewBox', '0 0 10 10');
    marker.setAttribute('refX', '10'); // Positionne la pointe de la flèche
    marker.setAttribute('refY', '5');
    marker.setAttribute('markerUnits', 'strokeWidth');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '10');
    marker.setAttribute('orient', 'auto');

    // Configurer les propriétés de la flèche
    arrow.setAttribute('d', 'M 0 0 L 10 5 L 0 10 L 2.5 5 Z'); // Coordonnées pour une flèche
    arrow.setAttribute('fill', 'black'); // Remplissage en noir

    // Ajouter la flèche au marqueur et le marqueur aux définitions
    marker.appendChild(arrow);
    defs.appendChild(marker);

    return marker;
}



// La fonction createSvgDefs crée un élément defs s'il n'existe pas déjà dans le conteneur SVG. 
//C'est là que les définitions réutilisables, comme les marqueurs, sont stockées dans SVG.
function createSvgDefs(svgContainer) {
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  svgContainer.appendChild(defs);
  return defs;
}







//=======+++++++++++++ SUPPRESSION DE RELATIONS LIEES A UNE CLASSE +++++++++++++==============// 


// Cette fonction le nom de la classe (className) dont les relations doivent être supprimées.
function deleteRelatedRelations(className) {

  //test dans log pour voir la classe supprimé & ses relations
  console.log(`Suppression des relations liées à la classe : ${className}`);

  
  //Elle parcourt toutes les relations stockées dans l'objet classRelations.
  //Pour chaque relation, elle vérifie si la classe à supprimer est soit la source (data-source) soit la destination (data-destination) de cette relation.
  Object.keys(classRelations).forEach(otherClassName => {
    classRelations[otherClassName] = classRelations[otherClassName].filter(relation => {
      const line = document.getElementById(relation.relationId);
      const isRelated = line && (line.getAttribute('data-source') === className || line.getAttribute('data-destination') === className);

      if (isRelated) {
        console.log(`Suppression de la relation : ${relation.relationId}`);
        console.log(`Suppression de la cardinalité de la source : ${relation.cardFromId}`);
        console.log(`Suppression de la cardinalité de la destination : ${relation.cardToId}`);
        
        //Si la classe à supprimer est liée à une relation, elle supprime cette relation du DOM en utilisant la fonction deleteSvgElementById(elementId).
        //Elle supprime également les éléments associés aux cardinalités de la source et de la destination.
        

        deleteSvgElementById(relation.relationId);
        deleteSvgElementById(relation.cardFromId);
        deleteSvgElementById(relation.cardToId);
        return false; // Ne pas inclure cette relation dans le nouveau tableau
      }
      return true;
    });
  });

  //Elle met à jour classRelations en supprimant la clé correspondante à la classe supprimée, effaçant ainsi toutes les relations impliquant cette classe.
  delete classRelations[className];
}




/*
  Cette fonction est une fonction utilitaire pour supprimer un élément SVG du DOM en utilisant son ID (elementId).
  Elle vérifie d'abord si l'élément existe (getElementById) et, le cas échéant, le supprime en utilisant parentNode.removeChild.
*/
function deleteSvgElementById(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.parentNode.removeChild(element);
  }
}


// ====================================#####fin relation######======================================//








//================================START PARTIE ATTRIBUTS ==========================================//



//Cette fonction permet d'ajouter un nouvel attribut à une classe sélectionnée.
//Une fois les informations obtenues, elle crée un nouvel objet Attribute avec le nom et le type spécifiés, l'ajoute à la classe sélectionnée (selectedClassElement), et met à jour l'interface utilisateur pour refléter ce changement.

function addAttributeToClass() {
  if (selectedClassElement) {
    const attributeName = prompt("Nom de l'attribut pour " + selectedClassElement.name + " :");

    // Liste des types d'attributs autorisés
    const allowedAttributeTypes = [
      "INT(11)",
      "VARCHAR(255)",
      "FLOAT",
      "DATE",
      "BOOLEAN"
    ];

    // Afficher les options disponibles
    const optionsString = allowedAttributeTypes.map((type, index) => `${index + 1}- ${type}`).join("\n");
    const attributeTypeNumber = parseInt(prompt(`Choisissez le numéro correspondant au type de l'attribut :\n${optionsString}`));

    const selectedType = getTypeByNumber(attributeTypeNumber, allowedAttributeTypes);

    if (attributeName && selectedType) {
      const attribute = new Attribute(attributeName, selectedType);
      selectedClassElement.addAttribute(attribute);
      updateClassElementUI(selectedClassElement);
    } else {
      alert("Numéro d'attribut non valide. Veuillez choisir parmi les options disponibles.");
    }
  } else {
    alert("Veuillez sélectionner une classe d'abord.");
  }
}




//Une fonction auxiliaire utilisée par addAttributeToClass() pour obtenir le type d'attribut correspondant au numéro saisi par l'utilisateur.

function getTypeByNumber(number, types) {
  // Vérifier si le numéro est valide
  if (number >= 1 && number <= types.length) {
    // Retourner le type correspondant
    return types[number - 1];
  } else {
    return null;
  }
}



/*
Cette fonction permet de modifier les attributs d'une classe.
Elle présente à l'utilisateur une liste des attributs actuels de la classe sélectionnée.
L'utilisateur choisit l'attribut à modifier, puis entre un nouveau nom et un nouveau type pour cet attribut.
Une fois les nouvelles informations saisies, elle met à jour les données de l'attribut sélectionné et actualise l'interface utilisateur pour refléter les modifications.
*/

function editAttributes() {
  if (selectedClassElement) {
      const attributes = selectedClassElement.attributes;

      // Construisez une boîte de dialogue pour l'édition des attributs
      let attributesDialog = "Attributs actuels :\n";
      attributes.forEach((attr, index) => {
          attributesDialog += `${index + 1}. ${attr.toString()}\n`; // Utilisation de toString pour obtenir la représentation sous forme de chaîne
      });

      // Demandez à l'utilisateur de choisir l'attribut à modifier
      const attributeIndex = parseInt(prompt(attributesDialog + "\nEntrez le numéro de l'attribut à modifier:"));

      // Vérifiez si l'index est valide
      if (!isNaN(attributeIndex) && attributeIndex > 0 && attributeIndex <= attributes.length) {
        const newName = prompt("Entrez le nouveau nom de l'attribut:");

        // Liste des types d'attributs autorisés pour l'édition
        const allowedAttributeTypes = [
          "INT(11)",
          "VARCHAR(255)",
          "FLOAT",
          "DATE",
          "BOOLEAN"
        ];
  
        // Afficher les options disponibles
        const optionsString = allowedAttributeTypes.map((type, index) => `${index + 1}- ${type}`).join("\n");
        const typeNumber = parseInt(prompt(`Choisissez le numéro correspondant au nouveau type de l'attribut :\n${optionsString}`));
  
        const newType = getTypeByNumber(typeNumber, allowedAttributeTypes);
  
        if (newName && newType) {
          const selectedAttribute = attributes[attributeIndex - 1];
          selectedAttribute.setName(newName);
          selectedAttribute.setType(newType);

          // Mettez à jour l'interface utilisateur de la classe
          updateClassElementUI(selectedClassElement);
        } else {
          alert("Numéro d'attribut ou type invalide. Veuillez choisir parmi les options disponibles.");
        }
      } else {
        alert("Numéro d'attribut invalide.");
      }
    } else {
      alert("Veuillez sélectionner une classe d'abord.");
    }
}



//Cette fonction gère la suppression d'un attribut d'une classe sélectionnée.

function deleteAttribute() {
  if (selectedClassElement) {
      const attributes = selectedClassElement.attributes;

      // Construisez une boîte de dialogue pour la suppression des attributs
      let attributesDialog = "Attributs actuels :\n";
      attributes.forEach((attr, index) => {
          attributesDialog += `${index + 1}. ${attr.toString()}\n`; // Utilisation de toString pour obtenir la représentation sous forme de chaîne
      });

      // Demandez à l'utilisateur de choisir l'attribut à supprimer
      const option = parseInt(prompt(attributesDialog + "\nEntrez le numéro de l'attribut à supprimer (0 pour annuler):"));

      if (!isNaN(option) && option > 0 && option <= attributes.length) {
          // Supprimer l'attribut sélectionné
          const attributeIndex = option - 1;
          const selectedAttribute = attributes[attributeIndex];

          // Supprimez l'attribut de la classe
          selectedClassElement.deleteAttribute(selectedAttribute);

          // Mettez à jour l'interface utilisateur de la classe
          updateClassElementUI(selectedClassElement);
      } else if (option === 0) {
          // Annuler la suppression
          return;
      } else {
          alert("Numéro d'attribut invalide.");
      }
  } else {
      alert("Veuillez sélectionner une classe d'abord.");
  }
}





//================================END PARTIE ATTRIBUTS ==========================================






//================================START PARTIE METHODES ==========================================

//Ces lignes pour gérer l'affichage de la boîte déroulante pour les méthodes
const methodActionButton = document.getElementById('methodActionButton');
const methodActionDropdown = document.getElementById('methodActionDropdown');

methodActionButton.addEventListener('click', () => {
  methodActionDropdown.style.display = (methodActionDropdown.style.display === 'none') ? 'block' : 'none';
});

document.getElementById('executeMethodAction').addEventListener('click', () => {
  methodActionChanged(); // Appelez la fonction existante pour gérer les actions sur les méthodes
  methodActionDropdown.style.display = 'none'; // Masquez la boîte déroulante après l'exécution de l'action
});



//-Cette fonction pour gérer les actions sur les méthodes
//-Cette fonction est appelée lorsque la valeur de l'élément avec l'ID methodAction change (probablement un menu déroulant ou un sélecteur).
function methodActionChanged() {
  const methodAction = document.getElementById('methodAction').value;

  switch (methodAction) {
    case 'add':
      addMethodToClass();
      break;
    case 'edit':
      editMethod();
      break;
    case 'delete':
      deleteMethod();
      break;
    default:
      console.error('Action non reconnue');
  }
}



/*
-AddMethodToClass() permet d'ajouter une nouvelle méthode à une classe sélectionnée.
-Elle collecte le nom et le type de retour pour la méthode, puis propose à l'utilisateur d'ajouter des paramètres à cette méthode.
-Une fois toutes les informations saisies, la méthode est créée avec les détails fournis et ajoutée à la classe sélectionnée, mettant à jour l'interface utilisateur pour refléter ces modifications.
*/
function addMethodToClass() {
  if (selectedClassElement) {
    const methodName = prompt("Entrer le nom de votre méthode pour la classe " + selectedClassElement.name + " :");
    if (methodName) {
      const allowedReturnTypes = [
        "Int",
        "String",
        "Void",
        "Boolean",
        "Date"
        // Add other allowed return types as needed
      ];

      const returnTypeNumber = parseInt(prompt(buildOptionsPrompt("Choisissez le type de retour de votre méthode :", allowedReturnTypes)));

      const returnType = getTypeByNumber(returnTypeNumber, allowedReturnTypes);

      if (returnType !== undefined) {
        const method = new Method(methodName, returnType);

        // Add parameters to the method
        let addParameters = confirm("Voulez-vous ajouter des paramètres à votre méthode?");
        while (addParameters) {
          const paramName = prompt("Nom du paramètre :");

          // List of allowed parameter types
          const allowedParamTypes = [
            "Int",
            "String",
            "Boolean",
            "Date"
            // Add other allowed parameter types as needed
          ];

          const paramTypeNumber = parseInt(prompt(buildOptionsPrompt("Choisissez le type de votre paramètre :", allowedParamTypes)));

          const paramType = getTypeByNumber(paramTypeNumber, allowedParamTypes);

          if (paramType !== undefined) {
            method.addParameter(new Parameter(paramName, paramType));
          } else {
            alert("Attention!! Numéro de type de paramètre invalide! Veuillez choisir parmi les options disponibles.");
          }

          // Ask if the user wants to add another parameter
          addParameters = confirm("Voulez-vous ajouter un autre paramètre?");
        }

        selectedClassElement.addMethod(method);
        updateClassElementUI(selectedClassElement);
      } else {
        alert("Attention!! Numéro de type de retour invalide! Veuillez choisir parmi les options disponibles.");
      }
    }
  } else {
    alert("Veuillez sélectionner une Classe d'abord.");
  }
}




//C'est une fonction utilitaire utilisée pour générer un message de prompt avec une liste d'options à choisir.
function buildOptionsPrompt(promptMessage, options) {
  const optionsString = options.map((type, index) => `${index + 1}- ${type}`).join("\n");
  return `${promptMessage}\n${optionsString}`;
}




//Cette fonction permet à l'utilisateur de modifier une méthode existante dans une classe sélectionnée.
//Elle affiche les méthodes actuelles de la classe et demande à l'utilisateur de choisir une méthode à modifier.
//Ensuite, elle permet à l'utilisateur de sélectionner l'aspect à modifier : le nom de la méthode, le type de retour ou les paramètres.
//met à jour l'interface utilisateur pour refléter ces changements.
function editMethod() {
  if (selectedClassElement) {
    const methods = selectedClassElement.methods;

    // Construisez une boîte de dialogue pour l'édition des méthodes
    let methodsDialog = "Méthodes actuelles :\n";
    methods.forEach((method, index) => {
      methodsDialog += `${index + 1}. ${method.name}\n`;
    });

    // Demandez à l'utilisateur de choisir la méthode à modifier
    const methodIndex = parseInt(prompt(methodsDialog + "\nEntrez le numéro de la méthode à modifier:"));

    // Vérifiez si l'index est valide
    if (!isNaN(methodIndex) && methodIndex > 0 && methodIndex <= methods.length) {
      const selectedMethod = methods[methodIndex - 1];

      // Demandez à l'utilisateur de choisir l'aspect à modifier
      const editOption = prompt(
        "Entrez le numéro de l'aspect à modifier:\n1. Modifier le nom\n2. Modifier le type de retour\n3. Modifier les paramètres"
      );

      switch (parseInt(editOption)) {
        case 1:
          const newMethodName = prompt("Entrez le nouveau nom de la méthode:");
          selectedMethod.name = newMethodName;
          break;
          case 2:

            const allowedReturnTypes = ["int", "string", "void", "float", "bool"];

            const returnTypeOptions = allowedReturnTypes.map((type, index) => `${index + 1}. ${type}`).join('\n');
            const returnTypeIndex = parseInt(prompt(`Entrez le numéro du type de retour:\n${returnTypeOptions}`));
          
            if (!isNaN(returnTypeIndex) && returnTypeIndex > 0 && returnTypeIndex <= allowedReturnTypes.length) {
              const newReturnType = allowedReturnTypes[returnTypeIndex - 1];
              selectedMethod.setReturnType(newReturnType);
            } else {
              alert("Option non valide.");
            }
            break;
        case 3:
          editMethodParameters(selectedMethod);
          break;
        default:
          alert("Option non valide.");
          return;
      }

      // Mettez à jour l'interface utilisateur de la classe
      updateClassElementUI(selectedClassElement);
    } else {
      alert("Numéro de méthode invalide.");
    }
  } else {
    alert("Veuillez sélectionner une classe d'abord.");
  }
}




//Edition de paramètres
function editMethodParameters(method) {
  // Liste des types de paramètres autorisés
  const allowedParamTypes = ["int", "string", "float", "bool"];

  // Demander à l'utilisateur de choisir l'action sur les paramètres
  const paramAction = prompt("Choisir une action sur les paramètres:\n1. Ajouter un paramètre\n2. Modifier un paramètre\n3. Supprimer un paramètre");

  switch (parseInt(paramAction)) {
    case 1:
      const paramNameAdd = prompt("Entrez le nom du nouveau paramètre:");
      const paramTypeOptionsAdd = allowedParamTypes.map((type, index) => `${index + 1}. ${type}`).join('\n');
      const paramTypeAdd = parseInt(prompt(`Entrez le numéro du type du nouveau paramètre:\n${paramTypeOptionsAdd}`));

      if (!isNaN(paramTypeAdd) && paramTypeAdd > 0 && paramTypeAdd <= allowedParamTypes.length) {
        const selectedParamType = allowedParamTypes[paramTypeAdd - 1];
        method.addParameter(new Parameter(paramNameAdd, selectedParamType));
      } else {
        alert("Option non valide.");
      }
      break;
    case 2:
      const paramToEdit = prompt("Entrez le nom du paramètre à modifier:");
      const existingParam = method.parameters.find(param => param.name === paramToEdit);

      if (existingParam) {
        const paramNameEdit = prompt("Entrez le nouveau nom du paramètre:");
        const paramTypeOptionsEdit = allowedParamTypes.map((type, index) => `${index + 1}. ${type}`).join('\n');
        const paramTypeEdit = parseInt(prompt(`Entrez le numéro du nouveau type du paramètre:\n${paramTypeOptionsEdit}`));

        if (!isNaN(paramTypeEdit) && paramTypeEdit > 0 && paramTypeEdit <= allowedParamTypes.length) {
          const selectedParamType = allowedParamTypes[paramTypeEdit - 1];
          existingParam.name = paramNameEdit;
          existingParam.type = selectedParamType;
        } else {
          alert("Option non valide.");
        }
      } else {
        alert("Le paramètre spécifié n'existe pas.");
      }
      break;
    case 3:
      const paramToDelete = prompt("Entrez le nom du paramètre à supprimer:");
      method.removeParameter(paramToDelete);
      break;
    default:
      alert("Option non valide.");
  }
}



//Cette fct permet l'affichage des méthodes actuelles de la classe et demande à l'utilisateur de choisir une méthode à supprimer.
//Si l'utilisateur choisit une méthode à supprimer, elle la retire du tableau des méthodes de la classe sélectionnée.
//Ensuite, elle met à jour l'interface utilisateur pour refléter la suppression de la méthode.
function deleteMethod() {
  if (selectedClassElement) {
    const methods = selectedClassElement.methods;

    // Construisez une boîte de dialogue pour la suppression des méthodes
    let methodsDialog = "Méthodes actuelles :\n";
    methods.forEach((method, index) => {
      methodsDialog += `${index + 1}. ${method.name}\n`;
    });

    // Demandez à l'utilisateur de choisir la méthode à supprimer
    const option = parseInt(prompt(methodsDialog + "\nEntrez le numéro de la méthode à supprimer (0 pour annuler):"));

    if (!isNaN(option) && option > 0 && option <= methods.length) {
      // Supprimer la méthode sélectionnée
      const methodIndex = option - 1;
      methods.splice(methodIndex, 1); // Supprimez la méthode du tableau

      // Mettez à jour l'interface utilisateur de la classe
      updateClassElementUI(selectedClassElement);
    } else if (option === 0) {
      // Annuler la suppression
      return;
    } else {
      alert("Numéro de méthode invalide.");
    }
  } else {
    alert("Veuillez sélectionner une classe d'abord.");
  }
}



//================================END PARTIE METHODES ==========================================



/*
Ces fonctions, selectClassElement() et updateClassElementUI() travaillent ensemble pour mettre en surbrillance visuellement un élément de classe sélectionné,
et pour mettre à jour son affichage dans l'interface utilisateur.
*/

function selectClassElement(classElement, classDiv) {
  if (selectedClassDiv) {
    selectedClassDiv.classList.remove('selected');
  }
  selectedClassElement = classElement;
  selectedClassDiv = classDiv;
  classDiv.classList.add('selected');
}


function updateClassElementUI(classElement) {
  const classDiv = document.querySelector(`.class-element[data-name="${classElement.name}"]`);
  if (classDiv) {
    classDiv.innerHTML = `<strong>${classElement.name}</strong>`;

    const contentDiv = document.createElement('div');
    contentDiv.innerHTML += '<hr>';

    classElement.attributes.forEach(attr => {
      contentDiv.innerHTML += `<div class="attribut">${attr.name} : ${attr.type}</div>`;
  });

    if (classElement.methods.length > 0) {
      contentDiv.innerHTML += '<hr>'; // Séparateur entre attributs et méthodes
    }

    classElement.methods.forEach(method => {
      contentDiv.innerHTML += `<div class="methode">+ ${method.toString()}</div>`;
  });
  

    classDiv.appendChild(contentDiv);
  }
}


//============================= Génération du code JAVA ======================================//
 

function collectClassData() {
  classesUML = {}; // Réinitialiser pour collecter de nouvelles données

  const classElements = document.querySelectorAll('.class-element');

  classElements.forEach(classDiv => {
      const className = classDiv.getAttribute('data-name');
      const attributes = [];
      const methods = [];

      // Extraction des attributs
      const attrElements = classDiv.querySelectorAll('.attribut');
      attrElements.forEach(attrEl => {
          const [nom, type] = attrEl.textContent.split(':').map(s => s.trim());
          attributes.push({ nom, type });
      });

      // Extraction des méthodes
      const methodElements = classDiv.querySelectorAll('.methode');
      methodElements.forEach(methodEl => {
          const methodText = methodEl.textContent.trim();
          const methodMatch = methodText.match(/\+\s*(\w+)\((.*?)\)\s*:\s*(\w+)/);

          if (methodMatch) {
              const [_, nom, paramString, typeRetour] = methodMatch;
              const params = paramString.split(',').map(param => {
                  const [type, nom] = param.trim().split(/\s+/);
                  return { nom, type };
              });

              methods.push({ nom, typeRetour, params });
          }
      });

     
          classesUML[className] = { attributs: attributes, methodes: methods};
      

  });
}


function generateAndDownloadJavaFile() {
  let javaCode = '';

  for (let className in classesUML) {
    let classInfo = classesUML[className];

    javaCode += `class ${className} {\n`;

    // Générer les attributs
    for (let attr of classInfo.attributs) {
      javaCode += `    private ${attr.type} ${attr.nom};\n`;
    }

    // Générer les méthodes
        for (let method of classInfo.methodes) {
      javaCode += `    public ${method.typeRetour} ${method.nom}`;
      if (method.params.length > 0) {
        const paramStrings = method.params.map(param => `${param.type} ${param.nom}`);
        javaCode += `(${paramStrings.join(', ')})`;
      } else {
        javaCode += `()`;
      }
      javaCode += ` {\n    \n    }\n`;
    }

    javaCode += `}\n\n`;
  }

  // Créer un objet Blob avec le contenu Java
  const blob = new Blob([javaCode], { type: 'text/plain' });

  // Créer un objet URL pour le Blob
  const url = URL.createObjectURL(blob);

  // Créer un lien pour le téléchargement
  const a = document.createElement('a');
  a.href = url;
  a.download = 'MonFichier.java'; // Nom du fichier Java
  a.style.display = 'none';

  // Ajouter le lien à la page et déclencher le téléchargement
  document.body.appendChild(a);
  a.click();

  // Nettoyer l'URL de l'objet Blob
  URL.revokeObjectURL(url);
}


//============================= Génération du code JAVA {fin}=================================//

