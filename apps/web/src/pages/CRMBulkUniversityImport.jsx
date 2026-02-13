import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Upload, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import CRMLayout from '@/components/crm/CRMLayout';

export default function CRMBulkUniversityImport() {
  const [importData, setImportData] = useState('');
  const [progress, setProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const queryClient = useQueryClient();

  const UK_UNIVERSITIES = `Abertay University — Dundee
Aberystwyth University — Aberystwyth
Anglia Ruskin University — Cambridge
Anglia Ruskin University — London
Arts University Bournemouth — Poole
Arts University Plymouth — Plymouth
Aston University — Birmingham
Bangor University — Bangor
Bath Spa University — Bath
Birkbeck, University of London — London
Birmingham City University — Birmingham
Birmingham Newman University — Birmingham
Bournemouth University — Poole
BPP University — London
Brunel University London — Uxbridge
Buckinghamshire New University — High Wycombe
Canterbury Christ Church University — Canterbury
Cardiff Metropolitan University — Cardiff
Cardiff University — Cardiff
City St George's, University of London — London
Coventry University — Coventry
Coventry University — London
Cranfield University — Cranfield
De Montfort University — Leicester
Durham University — Durham
Edge Hill University — Ormskirk
Edinburgh Napier University — Edinburgh
European School of Economics — London
Falmouth University — Falmouth
Glasgow Caledonian University — Glasgow
Goldsmiths, University of London — London
Guildhall School of Music and Drama — London
Harper Adams University — Newport
Hartpury University and Hartpury College — Gloucester
Heriot-Watt University — Edinburgh
Imperial College London — London
Keele University — Keele
King's College London — London
Kingston University — Kingston upon Thames
Lancaster University — Lancaster
Leeds Arts University — Leeds
Leeds Beckett University — Leeds
Leeds Conservatoire — Leeds
Leeds Trinity University — Leeds
Lincoln Bishop University — Lincoln
Liverpool Hope University — Liverpool
Liverpool John Moores University — Liverpool
Liverpool School of Tropical Medicine — Liverpool
London Business School — London
London Metropolitan University — London
London School of Hygiene and Tropical Medicine, University of London — London
London South Bank University — London
Loughborough University — Loughborough
Manchester Metropolitan University — Manchester
Middlesex University — London
Newcastle University — Newcastle upon Tyne
Northern School of Contemporary Dance — Leeds
Northumbria University — Newcastle upon Tyne
Northumbria University — London
Norwich University of the Arts — Norwich
Nottingham Trent University — Nottingham
Nottingham Trent University — London
Oxford Brookes University — Oxford
Plymouth Marjon University — Plymouth
Queen Margaret University — Edinburgh
Queen Mary University of London — London
Queen's University Belfast — Belfast
Ravensbourne University London — London
Regent's University London — London
Richmond, The American International University in London — London
Robert Gordon University — Aberdeen
Rose Bruford College — London
Royal College of Art — London
Royal College of Music — London
Royal Conservatoire of Scotland — Glasgow
Royal Holloway, University of London — Egham
Royal Northern College of Music — Manchester
School of Advanced Study, University of London — London
Scotland's Rural College — Edinburgh
Sheffield Hallam University — Sheffield
SOAS, University of London — London
Solent University — Southampton
St Mary's University, Twickenham — Twickenham
Swansea University — Swansea
Teesside University — Middlesbrough
The Courtauld Institute of Art, University of London — London
The Glasgow School of Art — Glasgow
The Liverpool Institute for Performing Arts — Liverpool
The London School of Economics and Political Science — London
The Royal Academy of Music, University of London — London
The Royal Agricultural University — Cirencester
The Royal Central School of Speech and Drama — London
The Royal Veterinary College University of London — London
The University of Buckingham — Buckingham
The University of Law — Guildford
The University of Law — London
The University of Northampton — Northampton
The University of York — York
Trinity Laban Conservatoire of Music and Dance — London
Ulster University — Coleraine
University College Birmingham — Birmingham
University College London — London
University for the Creative Arts — Farnham
University of Aberdeen — Aberdeen
University of Bath — Bath
University of Bedfordshire — Luton
University of Birmingham — Birmingham
University of Bradford — Bradford
University of Brighton — Brighton
University of Bristol — Bristol
University of Cambridge — Cambridge
University of Central Lancashire — Preston
University of Chester — Chester
University of Chichester — Chichester
University of Cumbria — Carlisle
University of Derby — Derby
University of Dundee — Dundee
University of East Anglia — Norwich
University of East London — London
University of Edinburgh — Edinburgh
University of Essex — Colchester
University of Exeter — Exeter
University of Glasgow — Glasgow
University of Gloucestershire — Cheltenham
University of Greater Manchester — Bolton
University of Greenwich — London
University of Hertfordshire — Hatfield
University of Huddersfield — Huddersfield
University of Hull — Hull
University of Kent — Canterbury
University of Leeds — Leeds
University of Leicester — Leicester
University of Lincoln — Lincoln
University of Liverpool — Liverpool
University of London — London
University of Manchester — Manchester
University of Nottingham — Nottingham
University of Oxford — Oxford
University of Plymouth — Plymouth
University of Portsmouth — Portsmouth
University of Reading — Reading
University of Roehampton — London
University of Salford — Salford
University of Sheffield — Sheffield
University of South Wales — Pontypridd
University of Southampton — Southampton
University of St Andrews — St Andrews
University of Staffordshire — Stoke-on-Trent
University of Stirling — Stirling
University of Strathclyde — Glasgow
University of Suffolk — Ipswich
University of Sunderland — Sunderland
University of Surrey — Guildford
University of Sussex — Brighton
University of the Arts London — London
University of the Highlands and Islands — Inverness
University of the West of England — Bristol
University of the West of Scotland — Paisley
University of Wales — Cardiff
University of Wales Trinity Saint David — Carmarthen
University of Warwick — Coventry
University of West London — Ealing
University of West London — London
University of Westminster — London
University of Winchester — Winchester
University of Wolverhampton — Wolverhampton
University of Worcester — Worcester
Walbrook Institute London — London
Wrexham University — Wrexham
York St John University — York`;

  const handleBulkImport = async () => {
    setIsImporting(true);
    setProgress(0);
    
    const lines = (importData || UK_UNIVERSITIES).split('\n').filter(line => line.trim());
    const universities = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const parts = line.split('—').map(p => p.trim());
      
      if (parts.length === 2) {
        universities.push({
          university_name: parts[0],
          city: parts[1],
          country: 'United Kingdom',
          intakes: 'January, September',
          status: 'active',
          show_on_country_page: true
        });
      }
      
      setProgress(Math.round(((i + 1) / lines.length) * 100));
    }
    
    try {
      await base44.entities.University.bulkCreate(universities);
      queryClient.invalidateQueries({ queryKey: ['universities'] });
      toast.success(`Successfully imported ${universities.length} universities!`);
      setImportData('');
    } catch (error) {
      toast.error('Import failed: ' + error.message);
    }
    
    setIsImporting(false);
    setProgress(0);
  };

  return (
    <CRMLayout currentPage="Bulk Import">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bulk University Import</h1>
          <p className="text-slate-600 mt-1">Import UK universities in bulk</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Import Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-slate-600 mb-2">
                Format: University Name — City (one per line)
              </p>
              <Textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Leave empty to import all UK universities listed..."
                rows={15}
                className="font-mono text-sm"
              />
            </div>

            {isImporting && (
              <div>
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-slate-600 mt-2 text-center">Importing... {progress}%</p>
              </div>
            )}

            <Button
              onClick={handleBulkImport}
              disabled={isImporting}
              className="w-full"
              style={{ backgroundColor: '#F37021' }}
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import {importData ? 'Custom' : 'All UK'} Universities
                </>
              )}
            </Button>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 font-semibold mb-2">
                <CheckCircle2 className="w-4 h-4 inline mr-1" />
                Pre-loaded with {UK_UNIVERSITIES.split('\n').filter(l => l.trim()).length} UK Universities
              </p>
              <p className="text-xs text-blue-700">
                Leave the text area empty to import all pre-loaded UK universities, or paste your own list in the format: Name — City
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </CRMLayout>
  );
}