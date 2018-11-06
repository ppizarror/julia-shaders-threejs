/*
JULIA-Z-SIN-EXP
FRAGMENT SHADER

Julia función avanzada. Cumple ecuación z_n = z*sin(z_n-1)/exp(z) + C.

@author Pablo Pizarro R. @ppizarror.com
@license MIT
@since 0.3.5
*/

// Activa precisión alta
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
precision mediump int;

// Pasa las coordenadas de cada punto (x,y) -> C
varying float c_r;
varying float c_i;

// Interaciones máximas
uniform int max_iterations;

// Rango de colores
uniform float r_min;
uniform float r_max;
uniform float g_min;
uniform float g_max;
uniform float b_min;
uniform float b_max;

// Constante c = j_re + i*j_im
uniform float j_re;
uniform float j_im;

/// COSH Function (Hyperbolic Cosine)
float cosh(float val)
{
    float tmp = exp(val);
    float cosH = (tmp + 1.0 / tmp) / 2.0;
    return cosH;
}

// TANH Function (Hyperbolic Tangent)
float tanh(float val)
{
    float tmp = exp(val);
    float tanH = (tmp - 1.0 / tmp) / (tmp + 1.0 / tmp);
    return tanH;
}

// SINH Function (Hyperbolic Sine)
float sinh(float val)
{
    float tmp = exp(val);
    float sinH = (tmp - 1.0 / tmp) / 2.0;
    return sinH;
}

// Inicio del shader
void main() {
	float r;
	float g;
	float b;
	float t;
	float w_r;
	float w_i;
	float u;
	float v;

	w_r = c_r;
	w_i = c_i;

	// Si converge es negro
	r = 0.0;
	g = 0.0;
	b = 0.0;

	for (int i = 0; i < 65536; i++) {
		u = w_r;
		v = w_i;

        // https://www.wolframalpha.com/input/?i=re(+(u%2Bi*v)*sin(u%2Bi*v)%2Fexp(u%2Bi*v))
		w_r = -exp(u)*v*cos(u)*cos(v)*sinh(v) + exp(-u)*v*sin(u)*sin(v)*cosh(v) + exp(-u)*u*cos(u)*sin(v)*sinh(v) + exp(-u)*u*sin(u)*cos(v)*cosh(v)+ j_re;
		w_i = exp(-u)*u*cos(u)*cos(v)*sinh(v) - exp(-u)*u*sin(u)*sin(v)*cosh(v) + exp(-u)*v*cos(u)*sin(v)*sinh(v) + exp(-u)*v*sin(u)*cos(v)*cosh(v)+ j_im;

		if (w_r*w_r + w_i*w_i > 4.0) { // |z| > 2

		    // Computa el rojo
			t = log(float(i + 1)) / log(float(max_iterations + 1));
			r = t*r_max + (1.0 - t)*r_min;

			// Computa el verde
			// t = float(i + 1) / float(max_iterations + 1);
			g = t*g_max + (1.0 - t)*g_min;

            // Computa el azul
			// t = log(log(float(i + 1))) / log(log(float(max_iterations + 1)));
			b = t*b_max + (1.0 - t)*b_min;

			break;
		}

		if (i >= max_iterations) {
			break;
		}
	}

	gl_FragColor = vec4(r, g, b, 1.0);
}