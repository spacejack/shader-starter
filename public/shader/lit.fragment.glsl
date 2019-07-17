// Ray Marching tutorial:
// https://www.youtube.com/watch?v=PGtv-dBi2wE

varying vec2 vUv;

uniform float time;
uniform vec2 resolution;

const int MAX_STEPS = 100;
const float MAX_DIST = 100.0;
const float SURF_DIST = 0.01;

const vec3 LIGHT_POS = vec3(0, 5, 6);

/**
 * x,y,z position
 * w is used to store radius
 */
const vec4 SPHERE = vec4(0.0, 0.0, 6.0, 2.0);
/** Epsilon */
const vec2 E = vec2(0.01, 0.0);

/** Distance from point to a sphere */
float distToSphere (vec3 p) {
	float dS = length(p - SPHERE.xyz) - SPHERE.w;
	float dP = p.y;
	return min(dS, dP);
}

vec3 getNormal (vec3 p) {
	float d = distToSphere(p);
	vec3 n = d - vec3(
		distToSphere(p - E.xyy),
		distToSphere(p - E.yxy),
		distToSphere(p - E.yyx)
	);
	return normalize(n);
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

float getLight (vec3 p) {
	vec3 lp = vec3(
		LIGHT_POS.x + sin(time) * 4.0,
		LIGHT_POS.y,
		LIGHT_POS.z + cos(time) * 4.0
	);
	vec3 l = normalize(lp - p);
	vec3 n = getNormal(p);
	float dif = clamp(dot(n, l), 0.0, 1.0);
    float d = rayMarch(p + n * SURF_DIST * 2.0, l);
    if (d < length(LIGHT_POS - p)) {
		dif *= .1;
	}
    return dif;
}

void mainImage (out vec4 fragColor, in vec2 fragCoord) {
	vec2 uv = (fragCoord - resolution.xy / 2.0) / resolution.y;
	vec3 ro = vec3(0.0, 1.0, 0.0);
	vec3 rd = normalize(vec3(uv.x, uv.y, 1.0));
	float d = rayMarch(ro, rd);

	vec3 p = ro + rd * d;

	float dif = getLight(p);
	vec3 col = vec3(dif);

	//col = getNormal(p);

	fragColor = vec4(col, 1.0);
}

void main()	{
	mainImage(gl_FragColor, gl_FragCoord.xy);
}
