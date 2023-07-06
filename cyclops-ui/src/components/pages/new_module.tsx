import React, {useEffect, useState} from 'react';
import {
    Alert,
    Button,
    Col,
    Collapse,
    Divider,
    Form,
    Input,
    InputNumber,
    message,
    Row,
    Select,
    Space,
    Switch,
    Typography,
    Tooltip
} from 'antd';
import axios from 'axios';
import {useNavigate} from 'react-router';
import {MinusCircleOutlined, PlusOutlined, InfoCircleOutlined} from "@ant-design/icons";

import {useParams} from "react-router-dom";

const {TextArea} = Input;

const {Title} = Typography;
const layout = {
    labelCol: {span: 3},
    wrapperCol: {span: 10},
};

const NewModule = () => {
    const [loading, setLoading] = useState(false);
    const [versions, setVersions] = useState([]);
    const [dplName, setName] = useState("");
    const [allConfigs, setAllConfigs] = useState([]);
    const [manifest, setManifest] = useState("");
    const [values, setValues] = useState({});
    const [config, setConfig] = useState({
        name: "",
        version: "",
        manifest: "",
        fields: [],
        properties: [],
    })

    const [gitTemplate, setGitTemplate] = useState({
        repo: "",
        path: ""
    })

    const [error, setError] = useState({
        message: "",
        description: "",
    });

    const [successLoad, setSuccessLoad] = useState(false);

    const [activeCollapses, setActiveCollapses] = useState(new Map());
    const updateActiveCollapses = (k: any, v: any) => {
        setActiveCollapses(new Map(activeCollapses.set(k,v)));
    }

    const history = useNavigate();

    const [form] = Form.useForm();

    let {name} = useParams();

    useEffect(() => {
        setLoading(true);
        // axios.get(process.env.REACT_APP_CYCLOPS_CTRL_HOST + `/configuration-details`).then(res => {
        //     setAllConfigs(res.data);
        // });

        setLoading(false);
    }, []);

    const configNames: {} | any = [];
    allConfigs.map((c: any) => {
        configNames.push(<Select.Option key={c.name}>{c.name}</Select.Option>)
    })

    const handleSubmit = (values: any) => {
        console.log({
            "values": values,
            "name": values["cyclops_module_name"],
            "template": config.name,
        })

        setLoading(true);

        axios.post(window.__RUNTIME_CONFIG__.REACT_APP_CYCLOPS_CTRL_HOST + `/modules/new`,
            {
                name: values["cyclops_module_name"],
                values: values,
                template: {
                    name: config.name,
                    version: config.version,
                    git: {
                        repo: gitTemplate.repo,
                        path: gitTemplate.path,
                    }
                },
            })
            .then(res => {
                console.log(res);
                window.location.href = "/modules/" + values["cyclops_module_name"]
            })
            .catch(error => {
                console.log(error)
                console.log(error.response)
                setLoading(false);
                if (error.response === undefined) {
                    setError({
                        message: String(error),
                        description: "Check if Cyclops backend is available on: " + window.__RUNTIME_CONFIG__.REACT_APP_CYCLOPS_CTRL_HOST
                    })
                    setSuccessLoad(false);
                } else {
                    setError(error.response.data);
                    setSuccessLoad(false);
                }
            })

        setName(values.app_name);
    }

    const handleCancel = () => {
        setLoading(false)
    };

    const handleChange = (value: any) => {
        setConfig({
            name: value,
            version: "",
            manifest: "",
            fields: [],
            properties: [],
        })

        axios.get(window.__RUNTIME_CONFIG__.REACT_APP_CYCLOPS_CTRL_HOST + `/configuration/` + value + `/versions`).then(res => {
            let configVersions = res.data.sort(function (a: string, b: string) {
                if (a === "latest") {
                    return -1
                }
                if (b === "latest") {
                    return 1
                }
                if (a < b) {
                    return 1;
                }
                if (a > b) {
                    return -1;
                }
                return 0;
            })

            console.log(configVersions);

            const versionOptions: {} | any = [];
            configVersions.map((v: any) => {
                versionOptions.push(<Select.Option key={v}>{v}</Select.Option>)
            })

            setVersions(versionOptions);
        });
    }

    const handleVersionChange = (value: any) => {
        axios.get(window.__RUNTIME_CONFIG__.REACT_APP_CYCLOPS_CTRL_HOST + `/create-config/` + config.name + `?version=` + value).then(res => {
            setConfig(res.data);
        });
    }

    const loadTemplate = () => {
        setGitTemplate({
            repo: "https://github.com/petar-cvit/starship",
            path: "charts/devnet",
        })

        axios.get(window.__RUNTIME_CONFIG__.REACT_APP_CYCLOPS_CTRL_HOST + `/templates/git?repo=` + gitTemplate.repo + `&path=` + gitTemplate.path).then(res => {
        //axios.get(window.__RUNTIME_CONFIG__.REACT_APP_CYCLOPS_CTRL_HOST + `/templates/git?repo=` + "https://github.com/petar-cvit/helm" + `&path=` + "demo").then(res => {
            setConfig(res.data);

            setError({
                message: "",
                description: "",
            });
            setSuccessLoad(true);
        }).catch(function (error) {
            if (error.response === undefined) {
                setError({
                    message: String(error),
                    description: "Check if Cyclops backend is available on: " + window.__RUNTIME_CONFIG__.REACT_APP_CYCLOPS_CTRL_HOST
                })
                setSuccessLoad(false);
            } else {
                setError(error.response.data);
                setSuccessLoad(false);
            }
        });

        axios.get(window.__RUNTIME_CONFIG__.REACT_APP_CYCLOPS_CTRL_HOST + `/templates/git/initial?repo=` + gitTemplate.repo + `&path=` + gitTemplate.path).then(res => {
            form.setFieldsValue(res.data);

            setError({
                message: "",
                description: "",
            });
            setSuccessLoad(true);
        }).catch(function (error) {
            if (error.response === undefined) {
                setError({
                    message: String(error),
                    description: "Check if Cyclops backend is available on: " + window.__RUNTIME_CONFIG__.REACT_APP_CYCLOPS_CTRL_HOST
                })
                setSuccessLoad(false);
            } else {
                setError(error.response.data);
                setSuccessLoad(false);
            }
        });
    }

    const getCollapseColor = (fieldName: string) => {
        if (activeCollapses.get(fieldName) && activeCollapses.get(fieldName) === true) {
            return "#faca93"
        } else {
            return "#fae8d4"
        }
    }

    const addonAfter = (field: any) => {
        if (field.description.length !== 0) {
            return <Tooltip title={field.description} trigger="click">
                <InfoCircleOutlined/>
            </Tooltip>
        }
    }

    function mapFields(fields: any[], parent: string, level: number) {
        const formFields: {} | any = [];
        fields.forEach((field: any) => {
            let fieldName = parent === "" ? field.name : parent.concat(".").concat(field.name)

            switch (field.type) {
                case "string":
                    formFields.push(
                        <Form.Item initialValue={field.initialValue} name={fieldName} id={fieldName}
                                   label={field.display_name} labelCol={{span: 4}}>
                            <Input addonAfter={addonAfter(field)}/>
                        </Form.Item>
                    )
                    return;
                case "number":
                    formFields.push(
                        <Form.Item initialValue={field.initialValue} name={fieldName} id={fieldName} label={
                            <Tooltip title={field.description} trigger="click">
                                {field.display_name}
                            </Tooltip>
                        } labelCol={{span: 4}}>
                            <InputNumber style={{width: '100%'}} addonAfter={addonAfter(field)}/>
                        </Form.Item>
                    )
                    return;
                case "boolean":
                    let checked = form.getFieldValue(fieldName) === true ? "checked" : "unchecked"
                    formFields.push(
                        <Form.Item initialValue={field.initialValue} name={fieldName} id={fieldName}
                                   label={field.display_name} labelCol={{span: 4}} valuePropName={checked}>
                            <Switch />
                        </Form.Item>
                    )
                    return;
                case "object":
                    var header = <Row>{field.name}</Row>

                    if (field.description && field.description.length !== 0) {
                        header = <Row gutter={[0, 8]}>
                            <Col span={15} style={{display: 'flex', justifyContent: 'flex-start'}}>
                                {field.name}
                            </Col>
                            <Col span={9} style={{display: 'flex', justifyContent: 'flex-end'}}>
                                <Tooltip title={field.description} trigger={["hover", "click"]}>
                                    <InfoCircleOutlined style={{right: "0px", fontSize: '20px'}}/>
                                </Tooltip>
                            </Col>
                        </Row>
                    }

                    formFields.push(
                        <Col span={24} offset={level === 0 ? 2 : 0} style={{
                            paddingBottom: "15px",
                            marginLeft: "0px",
                            marginRight: "0px",
                            paddingLeft: "0px",
                            paddingRight: "0px",
                        }}>
                            <Collapse size={"small"} onChange={function (value: string | string[]) {
                                if (value.length === 0) {
                                    updateActiveCollapses(fieldName, false)
                                } else {
                                    updateActiveCollapses(fieldName, true)
                                }
                            }}>
                                <Collapse.Panel key={fieldName} header={header} style={{backgroundColor: getCollapseColor(fieldName)}}>
                                    {mapFields(field.properties, fieldName, level + 1)}
                                </Collapse.Panel>
                            </Collapse>
                        </Col>
                    )
                    return;
                case "map":
                    formFields.push(
                        <Form.Item name={fieldName} label={field.display_name} labelCol={{span: 4}}>
                            <Form.List name={fieldName}>
                                {(fields, {add, remove}) => (
                                    <>
                                        {fields.map(({key, name, ...restField}) => (
                                            <Space key={key} style={{display: 'flex', marginBottom: 8}}
                                                   align="baseline">
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'key']}
                                                    rules={[{required: true, message: 'Missing key'}]}
                                                >
                                                    <Input/>
                                                </Form.Item>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'value']}
                                                    rules={[{required: true, message: 'Missing value'}]}
                                                >
                                                    <Input/>
                                                </Form.Item>
                                                <MinusCircleOutlined onClick={() => remove(name)}/>
                                            </Space>
                                        ))}
                                        <Form.Item>
                                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined/>}>
                                                Add
                                            </Button>
                                        </Form.Item>
                                    </>
                                )}
                            </Form.List>
                        </Form.Item>
                    )
            }
        })

        return formFields
    }

    // const formFields: {} | any = [];
    // config.fields.forEach((field: any) => {
    //     switch (field.type) {
    //         case "string":
    //             formFields.push(
    //                 <Form.Item initialValue={field.initialValue} name={field.name} id={field.name}
    //                            label={field.display_name}>
    //                     <Input addonAfter={
    //                         <Tooltip title={field.description} trigger="click">
    //                             <InfoCircleOutlined/>
    //                         </Tooltip>
    //                     }/>
    //                 </Form.Item>
    //             )
    //             return;
    //         case "number":
    //             formFields.push(
    //                 <Form.Item initialValue={field.initialValue} name={field.name} id={field.name} label={
    //                     <Tooltip title={field.description} trigger="click">
    //                         {field.display_name}
    //                     </Tooltip>
    //                 }>
    //                     <InputNumber style={{width: '100%'}} addonAfter={
    //                         <Tooltip title={field.description} trigger="click">
    //                             <InfoCircleOutlined/>
    //                         </Tooltip>
    //                     }/>
    //                 </Form.Item>
    //             )
    //             return;
    //         case "boolean":
    //             formFields.push(
    //                 <Form.Item initialValue={field.initialValue} name={field.name} id={field.name}
    //                            label={field.display_name}>
    //                     <Switch />
    //                 </Form.Item>
    //             )
    //             return;
    //         case "object":
    //             formFields.push(
    //                 <Collapse ghost >
    //                     <Collapse.Panel key={field.name} header={field.name}>
    //                         <Form.Item initialValue={field.initialValue} name={field.name} id={field.name}
    //                                    label={field.display_name}>
    //                             <Switch />
    //                         </Form.Item>
    //                     </Collapse.Panel>
    //                 </Collapse>
    //             )
    //             return;
    //         case "map":
    //             formFields.push(
    //                 <Form.Item name={field.name} label={field.display_name}>
    //                     <Form.List name={field.name}>
    //                         {(fields, {add, remove}) => (
    //                             <>
    //                                 {fields.map(({key, name, ...restField}) => (
    //                                     <Space key={key} style={{display: 'flex', marginBottom: 8}}
    //                                            align="baseline">
    //                                         <Form.Item
    //                                             {...restField}
    //                                             name={[name, 'key']}
    //                                             rules={[{required: true, message: 'Missing key'}]}
    //                                         >
    //                                             <Input/>
    //                                         </Form.Item>
    //                                         <Form.Item
    //                                             {...restField}
    //                                             name={[name, 'value']}
    //                                             rules={[{required: true, message: 'Missing value'}]}
    //                                         >
    //                                             <Input/>
    //                                         </Form.Item>
    //                                         <MinusCircleOutlined onClick={() => remove(name)}/>
    //                                     </Space>
    //                                 ))}
    //                                 <Form.Item>
    //                                     <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined/>}>
    //                                         Add
    //                                     </Button>
    //                                 </Form.Item>
    //                             </>
    //                         )}
    //                     </Form.List>
    //                 </Form.Item>
    //             )
    //     }
    // })

    return (
        <div>
            {
                error.message.length !== 0 && <Alert
                    message={error.message}
                    description={error.description}
                    type="error"
                    closable
                    afterClose={() => {setError({
                        message: "",
                        description: "",
                    })}}
                    style={{marginBottom: '20px'}}
                />
            }
            {
                successLoad && <Alert
                    message={"Loaded template successfully"}
                    description={error.description}
                    type="success"
                    closable
                    afterClose={() => {
                        setSuccessLoad(false);
                    }}
                    style={{marginBottom: '20px'}}
                />
            }
            <Row gutter={[40, 0]}>
                <Col span={23}>
                    <Title style={{textAlign: 'center'}} level={2}>
                        Define Module
                    </Title>
                </Col>
            </Row>
            <Row gutter={[40, 0]}>
                <Col span={24}>
                    <Form {...layout} form={form} autoComplete={"off"} onFinish={handleSubmit}>
                        <Divider orientation="left" orientationMargin="0">
                            Module template
                        </Divider>
                        <Input
                            placeholder={"Repository"}
                            style={{width: '40%'}}
                            onChange={(value: any) => {
                                setGitTemplate({
                                    repo: value.target.value,
                                    path: gitTemplate.path,
                                })
                            }}
                        />
                        {' / '}
                        <Input
                            placeholder={"Path"}
                            style={{width: '30%'}}
                            onChange={(value: any) => {
                                setGitTemplate({
                                    repo: gitTemplate.repo,
                                    path: value.target.value,
                                })
                            }}
                        />
                        {'  '}
                        <Button type="primary" htmlType="button" onClick={loadTemplate}>
                            Load
                        </Button>
                        <Divider orientation="left" orientationMargin="0">
                            Module name
                        </Divider>
                        <Form.Item name="cyclops_module_name" id="cyclops_module_name" label="Module name"
                                   rules={[
                                       {
                                           required: true,
                                           message: 'Module name',
                                       }
                                   ]}
                                   labelCol={{span: 4}}
                        >
                            <Input/>
                        </Form.Item>
                        <Divider orientation="left" orientationMargin="0">
                            Define Module
                        </Divider>
                        {mapFields(config.fields, "" , 0)}
                        <div style={{textAlign: "right"}}>
                            <Button type="primary" loading={loading} htmlType="submit" name="Save">
                                Save
                            </Button>{' '}
                            <Button type="ghost" htmlType="button" onClick={() => history('/')}>
                                Back
                            </Button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </div>
    );
}
export default NewModule;
