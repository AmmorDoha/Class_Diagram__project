export class Diagram {
  constructor() {
    this.classes = []; // Stocke les instances de ClassElement
    this.relations = []; // Stocke les instances de Relation
  }

  // Ajouter une classe au diagramme
  addClass(classElement) {
    if (classElement instanceof ClassElement) {
      this.classes.push(classElement);
    } else {
      console.error("Invalid class element");
    }
  }

  // Supprimer une classe du diagramme
  removeClass(className) {
    this.classes = this.classes.filter(cls => cls.name !== className);
  }

  // Ajouter une relation au diagramme
  addRelation(relation) {
    if (relation instanceof Relation) {
      this.relations.push(relation);
    } else {
      console.error("Invalid relation");
    }
  }

  // Supprimer une relation du diagramme
  removeRelation(fromClassName, toClassName) {
    this.relations = this.relations.filter(rel =>
      !(rel.fromClass.name === fromClassName && rel.toClass.name === toClassName));
  }

  // Méthode pour obtenir une représentation sous forme de chaîne de caractères
  toString() {
    let result = "Diagram:\n";
    this.classes.forEach(cls => {
      result += `Class: ${cls.name}\n`;
    });
    this.relations.forEach(rel => {
      result += `Relation: ${rel.toString()}\n`;
    });
    return result;
  }
}
