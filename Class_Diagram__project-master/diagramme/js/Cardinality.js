export class Cardinality {
  constructor(fromCardinality, toCardinality) {
    this.fromCardinality = fromCardinality; // Cardinalité du côté de la classe de départ
    this.toCardinality = toCardinality;     // Cardinalité du côté de la classe d'arrivée
  }

  setFromCardinality(fromCardinality) {
    this.fromCardinality = fromCardinality;
  }

  setToCardinality(toCardinality) {
    this.toCardinality = toCardinality;
  }

  toString() {
    return `${this.fromCardinality}..${this.toCardinality}`;
  }
}
