"use client"

export const baseVertexShaderSource = `
  precision highp float;
  attribute vec2 aPosition;
  // DECLARING varyings
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform vec2 texelSize; // This uniform IS used here

  void main () {
      // WRITING to varyings
      vUv = aPosition * 0.5 + 0.5;
      vL = vUv - vec2(texelSize.x, 0.0);
      vR = vUv + vec2(texelSize.x, 0.0);
      vT = vUv + vec2(0.0, texelSize.y);
      vB = vUv - vec2(0.0, texelSize.y);
      gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

export const copyShaderSource = `
  precision mediump float;
  precision mediump sampler2D;

  varying highp vec2 vUv;     // Interpolated UV coordinate
  uniform sampler2D uTexture; // Texture to copy from

  void main () {
      // Simply sample the input texture at the current UV
      gl_FragColor = texture2D(uTexture, vUv);
  }
`;

export const clearShaderSource = `
  precision mediump float;
  varying highp vec2 vUv; // Varying may not be strictly needed but often passed

  uniform float value;     // Value to clear to (used for pressure init)

  void main () {
      // Output a constant value, typically used for clearing pressure or divergence
      // Assumes the value is intended for the red channel (scalar fields)
      gl_FragColor = vec4(value, 0.0, 0.0, 1.0);
  }
`;

export const displayShaderSource = `
  precision highp float;
  precision highp sampler2D;
  // DECLARING varyings (MUST MATCH)
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  // DECLARING uniforms used
  uniform sampler2D uTexture;
  uniform vec2 texelSize; // This uniform IS used here (in #ifdef SHADING)

  // ... rest of shader using vUv, vL, vR, vT, vB, uTexture, texelSize ...
  void main () {
      // READING vUv
      vec3 c = texture2D(uTexture, vUv).rgb;

      #ifdef SHADING
          // READING vL, vR, vT, vB
          vec3 lc = texture2D(uTexture, vL).rgb;
          vec3 rc = texture2D(uTexture, vR).rgb;
          vec3 tc = texture2D(uTexture, vT).rgb;
          vec3 bc = texture2D(uTexture, vB).rgb;

          float dx = length(rc) - length(lc);
          float dy = length(tc) - length(bc);

          // READING texelSize
          vec3 n = normalize(vec3(dx, dy, length(texelSize) * 2.0));
          vec3 l = normalize(vec3(0.0, 0.0, 1.0));

          float diffuse = clamp(dot(n, l) * 0.7 + 0.7, 0.7, 1.0);
          c *= diffuse;
      #endif
      // ... rest of shader ...
      float density = length(c);
      float alpha = clamp(density * 1.5, 0.0, 1.0);

      #ifdef TRANSPARENT
        gl_FragColor = vec4(c, alpha);
      #else
        gl_FragColor = vec4(c, 1.0);
      #endif
  }
`;


export const splatShaderSource = `
  precision highp float;
  precision highp sampler2D;

  varying vec2 vUv;           // Interpolated UV coordinate

  uniform sampler2D uTarget;  // Texture to splat onto (dye or velocity)
  uniform float aspectRatio;  // Canvas aspect ratio (width / height) for correction
  uniform vec3 color;         // Color (for dye) or Velocity dx, dy (for velocity) to splat
  uniform vec2 point;         // Center of the splat in UV space [0, 1]
  uniform float radius;       // Radius of the splat effect

  void main () {
      // Calculate vector from current fragment to splat center
      vec2 p = vUv - point.xy;

      // Correct the x-component for aspect ratio to make splat appear circular
      p.x *= aspectRatio;

      // Calculate squared distance from center (cheaper than distance)
      float sqDist = dot(p, p);

      // Gaussian falloff based on distance and radius
      // Adjusting radius calculation: use (radius * radius) for variance control
      // Smaller radius values in the uniform will now result in smaller splats
      float falloff = exp(-sqDist / (radius * radius * 0.01)); // Fine-tune the denominator scaling factor (0.01 here)

      // Modulate the input color/velocity by the falloff
      vec3 splatValue = falloff * color;

      // Read the existing value from the target texture
      vec3 base = texture2D(uTarget, vUv).xyz;

      // Add the splat value to the base (additive blending)
      gl_FragColor = vec4(base + splatValue, 1.0); // Output combined value (alpha is usually 1 for FBOs)
  }
`;


export const advectionShaderSource = `
  precision highp float;
  precision highp sampler2D;

  varying vec2 vUv; // Interpolated UV coordinate

  uniform sampler2D uVelocity;    // Velocity field texture
  uniform sampler2D uSource;      // Source texture to advect (dye or velocity itself)
  uniform vec2 texelSize;         // Texel size of the simulation grid
  uniform vec2 dyeTexelSize;      // Texel size of the dye grid (if different, for manual filter)
  uniform float dt;               // Timestep delta
  uniform float dissipation;      // Dissipation factor for the source field

  // --- Manual Bilinear Filtering (used if OES_texture_float_linear is not supported) ---
  #ifdef MANUAL_FILTERING
    vec4 bilerp(sampler2D sam, vec2 uv, vec2 tsize) {
        // Clamp UV coords to prevent sampling outside the texture bounds
        vec2 clamped_uv = clamp(uv, vec2(0.0), vec2(1.0));

        // Convert UV to pixel coordinates centered on pixel centers
        vec2 st = clamped_uv / tsize - 0.5;

        vec2 iuv = floor(st);   // Integer part (bottom-left pixel index)
        vec2 fuv = fract(st);   // Fractional part (interpolation weights)

        // Sample the four neighboring pixel centers
        vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize); // bottom-left
        vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize); // bottom-right
        vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize); // top-left
        vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize); // top-right

        // Perform bilinear interpolation
        return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
    }
  #endif
  // --- End Manual Filtering ---

  void main () {
      // 1. Sample velocity at the current fragment's position
      vec2 vel = texture2D(uVelocity, vUv).xy;

      // 2. Calculate the position where the fragment came from (backtracing)
      // Scale velocity by dt and texel size (since velocity is often in grid units/sec)
      vec2 prevPos = vUv - dt * vel * texelSize;

      // 3. Sample the source texture at the calculated previous position
      vec4 result;
      #ifdef MANUAL_FILTERING
          // Determine which texel size to use for manual filtering
          // This assumes uSource could be either velocity or dye. A better approach
          // might be separate advection shaders or another uniform indicating the source type.
          // Using dyeTexelSize as a default if filtering is manual. Check if this is correct for velocity advection.
          vec2 sourceTexelSize = (uSource == uVelocity) ? texelSize : dyeTexelSize; // Example logic - NEEDS VERIFICATION
          result = bilerp(uSource, prevPos, sourceTexelSize);
      #else
          // Use hardware linear filtering
          result = texture2D(uSource, prevPos);
      #endif

      // 4. Apply dissipation (decay) to the sampled value
      float decay = 1.0 + dissipation * dt;
      gl_FragColor = result / max(decay, 1.0); // Ensure decay is at least 1
  }
`;

export const divergenceShaderSource = `
  precision mediump float;
  precision mediump sampler2D;

  varying highp vec2 vUv;
  varying highp vec2 vL; // Neighbor UVs
  varying highp vec2 vR;
  varying highp vec2 vT;
  varying highp vec2 vB;

  uniform sampler2D uVelocity; // Input velocity field

  void main () {
      // Sample the relevant velocity components from neighbors
      float velL = texture2D(uVelocity, vL).x; // u component from Left
      float velR = texture2D(uVelocity, vR).x; // u component from Right
      float velT = texture2D(uVelocity, vT).y; // v component from Top
      float velB = texture2D(uVelocity, vB).y; // v component from Bottom

      // Sample center velocity for boundary conditions
      vec2 velC = texture2D(uVelocity, vUv).xy;

      // Apply no-slip boundary conditions (velocity is zero at the boundary)
      // OR Reflecting boundary conditions (normal component flips sign)
      // Here using reflecting BC for simplicity (normal flow = 0):
      if (vL.x < 0.01) velL = -velC.x;
      if (vR.x > 0.99) velR = -velC.x;
      if (vB.y < 0.01) velB = -velC.y;
      if (vT.y > 0.99) velT = -velC.y;

      // Calculate divergence using central differencing: 0.5 * (d(u)/dx + d(v)/dy)
      // The division by 2*dx (texelSize.x) is implicitly handled by sampling neighbors
      float divergence = 0.5 * (velR - velL + velT - velB);

      gl_FragColor = vec4(divergence, 0.0, 0.0, 1.0); // Output divergence scalar
  }
`;

export const curlShaderSource = `
  precision mediump float;
  precision mediump sampler2D;

  varying highp vec2 vUv;
  varying highp vec2 vL; // Neighbor UVs
  varying highp vec2 vR;
  varying highp vec2 vT;
  varying highp vec2 vB;

  uniform sampler2D uVelocity; // Input velocity field

  void main () {
      // Sample the relevant velocity components from neighbors for curl calculation
      float velL_y = texture2D(uVelocity, vL).y; // v component from Left
      float velR_y = texture2D(uVelocity, vR).y; // v component from Right
      float velT_x = texture2D(uVelocity, vT).x; // u component from Top
      float velB_x = texture2D(uVelocity, vB).x; // u component from Bottom

      // Calculate curl (2D curl is a scalar vorticity: d(v)/dx - d(u)/dy)
      // Approximated using central differencing: 0.5 * ( (v_R - v_L)/dx - (u_T - u_B)/dy )
      // Assuming dx=dy=texelSize, the difference terms represent the derivatives
      float curl = 0.5 * (velR_y - velL_y - (velT_x - velB_x)); // dv/dx - du/dy

      gl_FragColor = vec4(curl, 0.0, 0.0, 1.0); // Output curl scalar (vorticity)
  }
`;


export const vorticityShaderSource = `
  precision highp float;
  precision highp sampler2D;

  varying vec2 vUv;
  varying vec2 vL; // Neighbor UVs
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;

  uniform sampler2D uVelocity; // Current velocity field (to be modified)
  uniform sampler2D uCurl;     // Curl field (scalar vorticity) computed in previous step
  uniform float curl;          // Vorticity confinement strength coefficient (user parameter)
  uniform float dt;            // Timestep

  void main () {
      // Sample curl (vorticity) at neighbors
      float curlL = texture2D(uCurl, vL).x;
      float curlR = texture2D(uCurl, vR).x;
      float curlT = texture2D(uCurl, vT).x;
      float curlB = texture2D(uCurl, vB).x;
      float curlC = texture2D(uCurl, vUv).x; // Curl at the center

      // Calculate the gradient of the *magnitude* (absolute value) of curl
      // This points towards regions of stronger rotation, regardless of direction
      float gradX = 0.5 * (abs(curlR) - abs(curlL));
      float gradY = 0.5 * (abs(curlT) - abs(curlB));
      vec2 curlMagGradient = vec2(gradX, gradY);

      // Normalize the gradient to get the direction vector (add epsilon for stability)
      vec2 direction = normalize(curlMagGradient + vec2(1e-5)); // Avoid division by zero

      // Calculate the confinement force
      // Force = Vorticity_Strength * dt * (Curl_Center * (Direction x Z_Axis))
      // In 2D, (Direction x Z) = (direction.y, -direction.x)
      vec2 force = curl * dt * curlC * vec2(direction.y, -direction.x);

      // Sample the current velocity
      vec2 velocity = texture2D(uVelocity, vUv).xy;

      // Add the confinement force to the velocity
      velocity += force;

      // Output the updated velocity
      gl_FragColor = vec4(velocity, 0.0, 1.0); // z-component often unused, alpha=1
  }
`;


export const pressureShaderSource = `
  precision mediump float;
  precision mediump sampler2D;

  varying highp vec2 vUv;
  varying highp vec2 vL; // Neighbor UVs
  varying highp vec2 vR;
  varying highp vec2 vT;
  varying highp vec2 vB;

  uniform sampler2D uPressure;   // Pressure field from the *previous* iteration
  uniform sampler2D uDivergence; // Divergence field calculated from velocity

  void main () {
      // Sample pressure from neighbors (from previous iteration's result)
      float pressureL = texture2D(uPressure, vL).x;
      float pressureR = texture2D(uPressure, vR).x;
      float pressureT = texture2D(uPressure, vT).x;
      float pressureB = texture2D(uPressure, vB).x;
      // float pressureC = texture2D(uPressure, vUv).x; // Center pressure (not used in standard Jacobi)

      // Sample divergence at the center for the right-hand side of the Poisson equation
      float divergence = texture2D(uDivergence, vUv).x;

      // Perform one Jacobi iteration for the Poisson equation:
      // P_new = (P_L + P_R + P_T + P_B - divergence * dx^2) / 4
      // Assuming dx=1 for simplicity (handled by neighbor sampling)
      // This solves laplacian(P) = divergence
      float newPressure = (pressureL + pressureR + pressureT + pressureB - divergence) * 0.25;

      gl_FragColor = vec4(newPressure, 0.0, 0.0, 1.0); // Output the updated pressure value
  }
`;


export const gradientSubtractShaderSource = `
  precision mediump float;
  precision mediump sampler2D;

  varying highp vec2 vUv;
  varying highp vec2 vL; // Neighbor UVs
  varying highp vec2 vR;
  varying highp vec2 vT;
  varying highp vec2 vB;

  uniform sampler2D uPressure; // Solved pressure field (from pressure iterations)
  uniform sampler2D uVelocity; // Input velocity field (potentially divergent)

  void main () {
      // Sample pressure from neighbors
      float pressureL = texture2D(uPressure, vL).x;
      float pressureR = texture2D(uPressure, vR).x;
      float pressureT = texture2D(uPressure, vT).x;
      float pressureB = texture2D(uPressure, vB).x;

      // Calculate the pressure gradient using central differencing:
      // grad(P) = ( (P_R - P_L) / (2*dx), (P_T - P_B) / (2*dy) )
      // The 0.5 factor accounts for the 2*dx, 2*dy terms assuming dx=dy=1 (handled by neighbor sampling)
      vec2 pressureGradient = 0.5 * vec2(pressureR - pressureL, pressureT - pressureB);

      // Sample the current (divergent) velocity
      vec2 velocity = texture2D(uVelocity, vUv).xy;

      // Subtract the pressure gradient from the velocity field
      // This projection step makes the resulting velocity field divergence-free
      // v_new = v_old - grad(P)
      velocity -= pressureGradient;

      gl_FragColor = vec4(velocity, 0.0, 1.0); // Output the divergence-free velocity
  }
`;