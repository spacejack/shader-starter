// Ray Marching tutorial:
// https://www.youtube.com/watch?v=PGtv-dBi2wE

varying vec2 vUv;

uniform float time;
uniform vec2 resolution;

const int MAX_STEPS = 100;
const float MAX_DIST = 100.0;
const float SURF_DIST = 0.01;

/**
 * x,y,z position
 * w is used to store radius
 */
const vec4 SPHERE = vec4(0.0, 1.0, 6.0, 1.0);

float distToSphere (vec3 p) {
	float dS = length(p - SPHERE.xyz) - SPHERE.w;
	float dP = p.y;
	return min(dS, dP);
}

/**
 * @param ro Ray Origin
 * @param rd Ray Direction
 */
float rayMarch (vec3 ro, vec3 rd) {
	float dO = 0.0;
	for (int i = 0; i < MAX_STEPS; i++) {
		vec3 p = ro + dO * rd;
		float dS = distToSphere(p);
		dO += dS;
		if (dS < SURF_DIST || dO > MAX_DIST) {
			break;
		}
	}
	return dO;
}

void mainImage (out vec4 fragColor, in vec2 fragCoord) {
	vec2 uv = (fragCoord - resolution.xy / 2.0) / resolution.y;
	vec3 col = vec3(0.0, 0.0, 0.0);
	vec3 ro = vec3(0.0, 1.0, 0.0);
	vec3 rd = normalize(vec3(uv.x, uv.y, 1.0));
	float d = rayMarch(ro, rd) / 6.0;
	col = vec3(d);
	fragColor = vec4(col, 1.0);
}

void main()	{
	mainImage(gl_FragColor, gl_FragCoord.xy);
}
