class NeutilityLogo extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    const altText = this.getAttribute('alt') || 'Neutility._ logo';
    this.shadowRoot.innerHTML = `
      <svg 
        role="img" 
        aria-label="${altText}" 
        viewBox="0 0 768 150" 
        xmlns="http://www.w3.org/2000/svg" 
        focusable="false">
        <title>${altText}</title>
        <!-- START SVG CONTENT -->
        <g transform="translate(-113.55858,-317.39072)">
          <rect style="fill:#000000;fill-opacity:1;stroke:#236ee2;stroke-width:1.87494;" 
                width="5.1250572" height="370.16199" x="459.46686" y="-875.16003" transform="rotate(90)"/>
          <g>
            <g transform="matrix(0.69808994,0,0,0.69808994,6.8241732,68.617912)">
              <path style="fill:#236ee2;fill-opacity:0;stroke-width:0.788086"
                    d="m 365.80387,463.40422 a 104.5,104.5 0 0 1 -104.5,104.5 104.5,104.5 0 0 1 -104.5,-104.5 104.5,104.5 0 0 1 104.5,-104.5 104.5,104.5 0 0 1 104.5,104.5 z"/>
              <g transform="matrix(0.52213797,0,0,0.52213797,156.35415,358.45449)"
                 style="fill:#e8f0fc;fill-opacity:1;stroke:none">
                <path d="M 201,0.99999975 C 90.824172,0.99999875 0.9999975,90.824181 0.9999995,201 0.9999995,311.17582 90.824182,401 201,401 311.17582,401 401,311.17582 401,201 401,90.824181 311.17582,0.99999975 201,0.99999975 Z M 201,48.46875 c 84.522,0 152.53125,68.00925 152.53125,152.53125 0,84.52199 -68.00926,152.53125 -152.53125,152.53125 C 116.47801,353.53125 48.468752,285.52199 48.468752,201 48.468752,116.478 116.478,48.46875 201,48.46875 Z"
                      style="fill:#2563c8;stroke:none"/>
                <path d="m 305.58724,187.00115 a 40.136829,40.136829 0 0 1 -40.13683,40.13682 40.136829,40.136829 0 0 1 -40.13683,-40.13682 40.136829,40.136829 0 0 1 40.13683,-40.13683 40.136829,40.136829 0 0 1 40.13683,40.13683 z"
                      style="fill:#2563c8;stroke:none"/>
              </g>
            </g>
            <text x="503.82895" y="447.09033"
                  font-family="'Noto Nastaliq Urdu'" font-size="60px"
                  fill="#236ee2" stroke="#ff0707" stroke-width="3.8">
              NeU<span>tility</span>._
            </text>
          </g>
          <path style="fill:#e8f0fc;fill-opacity:1;stroke:#e8f0fc;stroke-width:1.43631"
                d="M 386.55941,334.92817 V 451.0321"/>
        </g>
        <!-- END SVG CONTENT -->
      </svg>
    `;
  }
}

customElements.define('neutility-logo', NeutilityLogo);