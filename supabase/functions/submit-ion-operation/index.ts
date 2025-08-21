
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { operationId } = await req.json()

    if (!operationId) {
      throw new Error('Operation ID is required')
    }

    console.log('Submitting ION operation:', operationId)

    // Get the operation data
    const { data: operation, error: fetchError } = await supabase
      .from('ion_operations')
      .select('*')
      .eq('id', operationId)
      .single()

    if (fetchError) {
      throw fetchError
    }

    // Submit to ION network
    const ionResponse = await fetch('https://ion.tbd.network/operations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(operation.operation_data)
    })

    if (!ionResponse.ok) {
      const errorText = await ionResponse.text()
      console.error('ION submission failed:', errorText)
      throw new Error(`ION submission failed: ${errorText}`)
    }

    const ionResult = await ionResponse.json()
    console.log('ION submission successful:', ionResult)

    // Update operation status
    const { error: updateError } = await supabase
      .from('ion_operations')
      .update({
        status: 'anchored',
        transaction_id: ionResult.transactionId || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', operationId)

    if (updateError) {
      throw updateError
    }

    // Update DID status
    const { error: didUpdateError } = await supabase
      .from('dids')
      .update({
        status: 'anchored',
        updated_at: new Date().toISOString()
      })
      .eq('id', operation.did_id)

    if (didUpdateError) {
      throw didUpdateError
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: ionResult
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error submitting ION operation:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
