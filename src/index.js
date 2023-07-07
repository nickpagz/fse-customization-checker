import { Spinner } from '@wordpress/components';
import { useState, render, useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { store as coreDataStore } from '@wordpress/core-data';
import apiFetch from '@wordpress/api-fetch';
import { decodeEntities } from '@wordpress/html-entities';
 
function FSECustomizationChecker() {
    const [ globalStylesMods, setGlobalStylesMods ] = useState();

    const { templates, hasResolved } = useSelect(
        ( select ) => {
            const selectorArgs = [ 'postType', 'wp_template', { per_page: -1 } ];
            return {
                templates: select( coreDataStore ).getEntityRecords(
                    ...selectorArgs
                ),
                hasResolved: select( coreDataStore ).hasFinishedResolution(
                    'getEntityRecords',
                    selectorArgs
                ),
            };
        },
        []
    );

    const { templateParts, hasPartsResolved } = useSelect(
        ( select ) => {
            const selectorArgs = [ 'postType', 'wp_template_part', { per_page: -1 } ];
            return {
                templateParts: select( coreDataStore ).getEntityRecords(
                    ...selectorArgs
                ),
                hasPartsResolved: select( coreDataStore ).hasFinishedResolution(
                    'getEntityRecords',
                    selectorArgs
                ),
            };
        },
        []
    );

	const globalStylesId = useSelect( ( select ) => select( coreDataStore ).__experimentalGetCurrentGlobalStylesId(), [] );

    useEffect( () => {
        if ( ! globalStylesId ) {
            return;
        }

        apiFetch( { path: `/fse_customization_checker/v1/globalstyles/${globalStylesId}` } )
            .then( ( data ) => {
				let globalStylesContent = decodeEntities( data.last_revision_content );
                let globalStylesContentOriginal = decodeEntities( data.content );
                if ( globalStylesContent === null ) {
                    globalStylesContent = globalStylesContentOriginal;
                }
				let jsObject = JSON.parse(globalStylesContent);
                setGlobalStylesMods( jsObject );
            } );
    }, [ globalStylesId ] );

    if ( ! globalStylesMods ) {
        return <Spinner />;
    }
  
    return (
        <div>
            <div>
                <TemplateList hasResolved={ hasResolved } templates={ templates } />
            </div>
            <div>
                <TemplatePartsList hasPartsResolved={ hasPartsResolved } templateParts={ templateParts } />
            </div>
            <div className="fse-customization-checker-global-styles">
                <h2>Global Styles Overrides:</h2>
                <pre>{ JSON.stringify(globalStylesMods, null, 2).replace(/\\n/g, '') }</pre>
            </div>
        </div>
    );
}

function TemplatePartsList( { hasPartsResolved, templateParts } ) {
    if ( ! hasPartsResolved ) {
        return <Spinner />;
    }
    if ( ! templateParts?.length ) {
        return <div>No results</div>;
    }
    console.log(templateParts);
  
    return (
        <table className="wp-list-table widefat fixed striped table-view-list fse-template-parts-table">
            <thead>
                <tr>
                    <td>Template Part</td>
                    <td>Slug</td>
					<td style={{width: 200}}>Customized</td>
                </tr>
            </thead>
            <tbody>
                { templateParts?.map( ( templatePart ) => {
                    let customizedStatus = '';
                    if (templatePart.source === "custom") {
                        if (templatePart.origin === "theme") {
                            customizedStatus = 'Customized theme template part';
                        } else if (templatePart.origin === null) {
                            customizedStatus = 'User generated';
                        }
                    }

                    return (
                        <tr key={ templatePart.id }>
                            <td>{ decodeEntities( templatePart.title.rendered ) }</td>
                            <td>{ templatePart.slug }</td>
                            <td>{ customizedStatus }</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}
  
function TemplateList( { hasResolved, templates } ) {
    if ( ! hasResolved ) {
        return <Spinner />;
    }
    if ( ! templates?.length ) {
        return <div>No results</div>;
    }
    console.log(templates);
  
    return (
        <table className="wp-list-table widefat fixed striped table-view-list fse-templates-table">
            <thead>
                <tr>
                    <td>Template</td>
                    <td>Slug</td>
					<td style={{width: 200}}>Customized</td>
                </tr>
            </thead>
            <tbody>
                { templates?.map( ( template ) => {
                    let customizedStatus = '';
                    if (template.source === "custom") {
                        if (template.origin === "theme") {
                            customizedStatus = 'Customized theme template';
                        } else if (template.origin === null) {
                            customizedStatus = 'User generated';
                        }
                    }

                    return (
                        <tr key={ template.id }>
                            <td>{ decodeEntities( template.title.rendered ) }</td>
                            <td>{ template.slug }</td>
                            <td>{ customizedStatus }</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}
 
window.addEventListener(
    'load',
    function () {
        render(
            <FSECustomizationChecker />,
            document.querySelector( '#fse-customization-checker' )
        );
    },
    false
);
