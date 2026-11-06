/** Small geometry helpers. Owns mesh data only, never scene layout or drill decisions. */
export type Point3 = [number, number, number];
export type Color4 = [number, number, number, number];

export class TwoMinutesMesh {
  private vertices: number[] = [];
  private indices: number[] = [];

  private vertex(p: Point3, n: Point3, c: Color4): number {
    const index = this.vertices.length / 10;
    this.vertices.push(...p, ...c, ...n);
    return index;
  }

  box(center: Point3, size: Point3, color: Color4): this {
    // Each face has its own vertices and normals. u cross v points outwards.
    const faces: [Point3, Point3, Point3, number][] = [
      [[1, 0, 0], [0, 0, -1], [0, 1, 0], .82],
      [[-1, 0, 0], [0, 0, 1], [0, 1, 0], .72],
      [[0, 1, 0], [1, 0, 0], [0, 0, -1], 1],
      [[0, -1, 0], [1, 0, 0], [0, 0, 1], .62],
      [[0, 0, 1], [1, 0, 0], [0, 1, 0], .9],
      [[0, 0, -1], [-1, 0, 0], [0, 1, 0], .75]
    ];
    for (const [n, u, v, shade] of faces) {
      const ids: number[] = [];
      for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        const p = center.map((value, k) => value + (n[k] + a * u[k] + b * v[k]) * size[k] / 2) as Point3;
        ids.push(this.vertex(p, n, [color[0] * shade, color[1] * shade, color[2] * shade, color[3]]));
      }
      this.indices.push(ids[0], ids[1], ids[2], ids[0], ids[2], ids[3]);
    }
    return this;
  }

  lathe(profile: [number, number][], color: Color4, segments = 64): this {
    const base = this.vertices.length / 10;
    for (let j = 0; j < profile.length; j++) {
      const prev = profile[Math.max(0, j - 1)];
      const next = profile[Math.min(profile.length - 1, j + 1)];
      const dr = next[0] - prev[0], dy = next[1] - prev[1];
      const length = Math.max(.0001, Math.sqrt(dr * dr + dy * dy));
      for (let i = 0; i <= segments; i++) {
        const angle = i * Math.PI * 2 / segments;
        const co = Math.cos(angle), si = Math.sin(angle);
        const shade = .78 + .22 * Math.max(0, dy / length * si);
        this.vertex([profile[j][0] * co, profile[j][1], profile[j][0] * si],
          [dy * co / length, -dr / length, dy * si / length],
          [color[0] * shade, color[1] * shade, color[2] * shade, color[3]]);
      }
    }
    for (let j = 0; j < profile.length - 1; j++) {
      for (let i = 0; i < segments; i++) {
        const a = base + j * (segments + 1) + i, b = a + 1, c = a + segments + 1, d = c + 1;
        this.indices.push(a, c, b, b, c, d);
      }
    }
    return this;
  }

  attach(parent: SceneObject, name: string, material: Material): SceneObject {
    const object = global.scene.createSceneObject(name);
    object.setParent(parent);
    const builder = new MeshBuilder([
      {name: "position", components: 3}, {name: "color", components: 4},
      {name: "normal", components: 3, normalized: true}
    ]);
    builder.topology = MeshTopology.Triangles;
    builder.indexType = MeshIndexType.UInt16;
    builder.appendVerticesInterleaved(this.vertices);
    builder.appendIndices(this.indices);
    const visual = object.createComponent("Component.RenderMeshVisual") as RenderMeshVisual;
    visual.mesh = builder.getMesh();
    visual.mainMaterial = material;
    builder.updateMesh();
    return object;
  }
}
