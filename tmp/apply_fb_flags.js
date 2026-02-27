const fs = require('fs');
const path = require('path');

const files = [
  'seccions/minis.html','seccions/s7.html','seccions/s8.html','seccions/s9.html','seccions/s10.html','seccions/s11.html','seccions/s12.html','seccions/s13.html','seccions/s14.html','seccions/s16.html',
  'seccions/alevi-femeni.html','seccions/cadet-femeni.html','seccions/infantil-femeni.html','seccions/juvenil-femeni.html','seccions/juvenil-masculi.html'
];

function ensureReplace(text, find, replace, file) {
  if (!text.includes(find)) throw new Error(`${file}: pattern not found`);
  return text.replace(find, replace);
}

for (const rel of files) {
  const file = path.join(process.cwd(), rel);
  let text = fs.readFileSync(file, 'utf8');

  if (!text.includes('function toBool(value){')) {
    const marker = `function isNumericId(value){\r\n            return /^\\d+$/.test(String(value||'').trim());\r\n        }`;
    const add = `${marker}\r\n\r\n        function toBool(value){\r\n            if(typeof value==='boolean') return value;\r\n            if(typeof value==='number') return value!==0;\r\n            const text=String(value??'').trim().toLowerCase();\r\n            if(!text) return false;\r\n            if(['true','t','1','yes','si','sí'].includes(text)) return true;\r\n            if(['false','f','0','no'].includes(text)) return false;\r\n            return !!value;\r\n        }`;
    if (text.includes(marker)) text = text.replace(marker, add);
  }

  text = text.replace(
    /(<th style="text-align:center;">[^<]*Revisi(?:ó|&oacute;) m(?:è|&egrave;)dica<\/th>\r?\n\s*)(<th class="plantilla-actions"><\/th>)/,
    `$1<th style="text-align:center;">Inscripció</th>\r\n                        <th style="text-align:center;">Pagament FCF</th>\r\n                        <th style="text-align:center;">Vinculat al club</th>\r\n                        $2`
  );

  text = text.replace(
    /<div class="form-row-3">\r?\n\s*<div><label>Nom i Cognoms<\/label><input type="text" id="p_nom" placeholder="Nom\.\.\."><\/div>\r?\n\s*<div><label>Any de naixement<\/label><input type="number" id="p_naixement" min="1990" max="2030" placeholder="Ex: 2014"><\/div>\r?\n\s*<div><label>[^<]*Revisi(?:ó|&oacute;) m(?:è|&egrave;)dica<\/label><input type="checkbox" id="p_revisio"><\/div>\r?\n\s*<\/div>/,
`<div class="form-row-4">\r\n                <div><label>Nom i Cognoms</label><input type="text" id="p_nom" placeholder="Nom..."></div>\r\n                <div><label>Any de naixement</label><input type="number" id="p_naixement" min="1990" max="2030" placeholder="Ex: 2014"></div>\r\n                <div><label>Revisió mèdica</label><input type="checkbox" id="p_revisio"></div>\r\n                <div><label>Inscripció</label><input type="checkbox" id="p_inscripcio"></div>\r\n            </div>\r\n            <div class="form-row-3" style="margin-bottom:0;">\r\n                <div><label>Pagament FCF</label><input type="checkbox" id="p_pagament_fcf"></div>\r\n                <div><label>Vinculat al club</label><input type="checkbox" id="p_vinculat_club"></div>\r\n                <div></div>\r\n            </div>`
  );

  text = text.replace(
    /revisio:\s*!!j\.revisio/,
    `revisio:toBool(j.revisio),\r\n                        inscripcio:toBool(j.inscripcio_feta ?? j.inscripcio),\r\n                        pagament_fcf:toBool(j.pagament_fcf_fet ?? j.pagament_fcf),\r\n                        vinculat_club:toBool(j.vinculat_club)`
  );

  text = text.replace('colspan="4" class="empty-msg"', 'colspan="7" class="empty-msg"');

  text = text.replace(
    `const checked=p.revisio?'checked':'';`,
`const checkedRevisio=p.revisio?'checked':'';
                const checkedInscripcio=p.inscripcio?'checked':'';
                const checkedPagamentFcf=p.pagament_fcf?'checked':'';
                const checkedVinculatClub=p.vinculat_club?'checked':'';`
  );

  text = text.replace(
    `+'<td style="text-align:center;"><input type="checkbox" '+checked+' onchange="updatePlayer('+i+',\\'revisio\\',this.checked)"></td>'`,
`+'<td style="text-align:center;"><input type="checkbox" '+checkedRevisio+' onchange="updatePlayer('+i+',\\'revisio\\',this.checked)"></td>'
                    +'<td style="text-align:center;"><input type="checkbox" '+checkedInscripcio+' onchange="updatePlayer('+i+',\\'inscripcio\\',this.checked)"></td>'
                    +'<td style="text-align:center;"><input type="checkbox" '+checkedPagamentFcf+' onchange="updatePlayer('+i+',\\'pagament_fcf\\',this.checked)"></td>'
                    +'<td style="text-align:center;"><input type="checkbox" '+checkedVinculatClub+' onchange="updatePlayer('+i+',\\'vinculat_club\\',this.checked)"></td>'`
  );

  text = text.replace(
    `const revisio=document.getElementById('p_revisio').checked;`,
`const revisio=document.getElementById('p_revisio').checked;
            const inscripcio=document.getElementById('p_inscripcio').checked;
            const pagamentFcf=document.getElementById('p_pagament_fcf').checked;
            const vinculatClub=document.getElementById('p_vinculat_club').checked;`
  );

  text = text.replace(
    /plantilla\.push\(\{id:`local_\$\{Date\.now\(\)\}`,nom,naixement,revisio\}\);/,
    `plantilla.push({id:\`local_\${Date.now()}\`,nom,naixement,revisio,inscripcio,pagament_fcf:pagamentFcf,vinculat_club:vinculatClub});`
  );

  text = text.replace(
    /document\.getElementById\('p_revisio'\)\.checked=false;\r?\n\s*renderPlantilla\(\);/g,
`document.getElementById('p_revisio').checked=false;
                document.getElementById('p_inscripcio').checked=false;
                document.getElementById('p_pagament_fcf').checked=false;
                document.getElementById('p_vinculat_club').checked=false;
                renderPlantilla();`
  );

  text = text.replace(
    /body:JSON\.stringify\(\{equip_id:EQUIP_ID,nom,any_naixement:naixement,revisio_medica:revisio\}\)/,
    `body:JSON.stringify({equip_id:EQUIP_ID,nom,any_naixement:naixement,revisio_medica:revisio,inscripcio_feta:inscripcio,pagament_fcf_fet:pagamentFcf,vinculat_club:vinculatClub})`
  );

  text = text.replace(
    /plantilla\.push\(\{id:String\(created\.id\),nom:created\.nom\|\|nom,naixement:normalizeBirthYear\(created\.any_naixement\|\|created\.naixement\|\|naixement\),revisio:!!created\.revisio\}\);/,
    `plantilla.push({id:String(created.id),nom:created.nom||nom,naixement:normalizeBirthYear(created.any_naixement||created.naixement||naixement),revisio:toBool(created.revisio),inscripcio:toBool(created.inscripcio_feta ?? inscripcio),pagament_fcf:toBool(created.pagament_fcf_fet ?? pagamentFcf),vinculat_club:toBool(created.vinculat_club ?? vinculatClub)});`
  );

  text = text.replace(
    `if(field==='revisio') plantilla[index].revisio=!!value;`,
`if(field==='revisio') plantilla[index].revisio=!!value;
            if(field==='inscripcio') plantilla[index].inscripcio=!!value;
            if(field==='pagament_fcf') plantilla[index].pagament_fcf=!!value;
            if(field==='vinculat_club') plantilla[index].vinculat_club=!!value;`
  );

  text = text.replace(
    `if(field==='revisio') body.revisio_medica=player.revisio;`,
`if(field==='revisio') body.revisio_medica=player.revisio;
            if(field==='inscripcio') body.inscripcio_feta=player.inscripcio;
            if(field==='pagament_fcf') body.pagament_fcf_fet=player.pagament_fcf;
            if(field==='vinculat_club') body.vinculat_club=player.vinculat_club;`
  );

  fs.writeFileSync(file, text, 'utf8');
  console.log('patched', rel);
}
