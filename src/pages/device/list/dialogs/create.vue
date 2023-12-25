<template>
  <iot-dialog :visible="visible" :width="1000" :title="isCreate ? '新增' : '修改'" @handle="handle" @confirm="confirm" @cancel="cancel" dense>
    <q-form>
      <q-list>
        <!-- 归属空间资源 -->
        <q-expansion-item label="归属资源空间" :header-class="[$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3']" default-opened dense>
          <q-card-section class="card-section">
            <iot-form-item
              label="归属资源空间"
              :value.sync="forms.resSpaceId"
              :validator="$v.forms.resSpaceId"
              :options="resSpaceIdOptions"
              option-label="resSpaceName"
              option-value="id"
              type="select"
              width="110"
            >
              <template v-slot:after>
                <div @click="$router.push({ name: 'system-resource' })" class="text-sm text-primary cursor-pointer">创建资源空间</div>
              </template>
            </iot-form-item>
          </q-card-section>
        </q-expansion-item>

        <!-- 基本信息 -->
        <q-expansion-item label="基本信息" :header-class="[$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3']" default-opened dense>
          <q-card-section class="card-section">
            <iot-form-item label="设备名称" :value.sync="forms.name" :validator="$v.forms.name" type="text" maxlength="32" width="110" />
            <iot-form-item label="设备sn码" :value.sync="forms.deviceSn" :validator="$v.forms.deviceSn" type="text" maxlength="64" width="110" />
            <iot-form-item v-if="field.productId" :value="field.productId" label="所属产品" type="field" width="110" />
            <iot-form-item
              v-else
              label="所属产品"
              :value.sync="forms.productId"
              :validator="$v.forms.productId"
              :options="productIdOptions"
              @input="productIdInput"
              option-label="name"
              option-value="id"
              type="select"
              width="110"
              filter
            />
            <iot-form-item v-if="field.pid" :value="field.pid" label="父设备" type="field" width="110" />
            <iot-form-item
              v-else-if="surface.nodeType === 2"
              label="父设备"
              :value.sync="forms.pid"
              :options="pidOptions"
              option-label="name"
              option-value="id"
              type="select"
              width="110"
              filter
            >
              <template v-slot:after>
                <q-btn @click="refreshPidOptions" icon="refresh" dense round />
              </template>
            </iot-form-item>
            <!-- 4-BACNET -->
            <template v-if="[4].includes(surface.agreementType)">
              <iot-form-item label="设备实例号" :value.sync="forms.instanceNumber" type="number" width="110" />
            </template>
            <!-- 2-MODBUS-TCP；4-BACNET；7-TCP客户端 -->
            <template v-if="[2, 4, 7].includes(surface.agreementType)">
              <iot-form-item label="服务器ip" :validator="$v.forms.serverIp" :value.sync="forms.serverIp" type="text" maxlength="15" width="110" />
              <iot-form-item label="服务器端口" :value.sync="forms.serverPort" type="number" min="0" max="65535" hint="0 ~ 65535" width="110" />
            </template>
            <!-- 1-TCP服务端；5-HTTP/HTTPS客户端；6-UDP；8-HTTP/HTTPS服务端 -->
            <template v-if="[1, 5, 6, 8].includes(surface.agreementType)">
              <iot-form-item
                label="是否固定ip"
                :value.sync="forms.isFixedIp"
                :options="switchNumberOptions"
                key="isFixedIp"
                type="radio"
                width="110"
              />
              <template v-if="forms.isFixedIp === 1">
                <iot-form-item label="设备ip" :validator="$v.forms.clientIp" :value.sync="forms.clientIp" type="text" maxlength="32" width="110" />
              </template>
            </template>
            <!-- 3-OPC-UA -->
            <template v-if="[3].includes(surface.agreementType)">
              <iot-form-item label="服务器地址" :value.sync="forms.endPointUrl" type="text" maxlength="128" width="110" />
              <iot-form-item label="安全模式" :value.sync="forms.securityMode" :options="securityModeOptions" type="radio" width="110" />
              <template v-if="forms.securityMode !== 'None'">
                <iot-form-item label="安全策略" :value.sync="forms.securityPolicy" :options="securityPolicyOptions" type="select" width="110" />
                <iot-form-item label="数字证书" :value.sync="forms.digitalrKey" type="text" maxlength="32" width="110" readonly />
                <iot-form-item label="密钥证书" :value.sync="forms.cipherKey" type="text" maxlength="32" width="110" readonly />
              </template>
              <iot-form-item label="用户名" :value.sync="forms.userName" type="text" maxlength="32" width="110" />
              <iot-form-item label="密码" :value.sync="forms.password" type="text" maxlength="32" width="110" />
            </template>
            <!--  -->
            <iot-form-item label="品牌厂商" :value.sync="forms.deviceBrand" :options="deviceBrandOptions" type="select" maxlength="32" width="110" />
            <iot-form-item
              label="设备型号"
              :value.sync="forms.deviceModel"
              :validator="$v.forms.deviceModel"
              type="text"
              maxlength="32"
              width="110"
            />
            <iot-form-item label="固件版本" :value.sync="forms.firmwareVersion" type="text" maxlength="32" width="110" />
          </q-card-section>
        </q-expansion-item>

        <!-- 位置信息 -->
        <q-expansion-item label="位置信息" :header-class="[$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3']" dense>
          <q-card-section class="card-section">
            <iot-form-item
              label="位置坐标"
              :value.sync="forms.location"
              :validator="$v.forms.location"
              hint="经度-180~180, 纬度-90~90, 高度"
              type="text"
              width="110"
            />
            <iot-form-item label="位置区域" :value.sync="forms.positionArea" type="text" maxlength="32" width="110" />
            <iot-form-item label="所属范围" :value.sync="forms.positionSite" type="text" maxlength="32" width="110" />
            <div class="flex full-width">
              <iot-form-item :value.sync="forms.positionDescription" label="位置描述" type="textarea" maxlength="100" width="110" />
              <iot-form-item :value.sync="forms.describe" label="设备描述" type="textarea" maxlength="100" width="110" />
            </div>
          </q-card-section>
        </q-expansion-item>

        <!-- 自定义信息 -->
        <q-expansion-item label="自定义信息" :header-class="[$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3']" dense>
          <q-card-section class="card-section">
            <div class="col">
              <iot-table-simple :data="forms.kvList" :columns="columns">
                <template v-slot:handle="{ props }">
                  <q-icon @click="delKv(props.rowIndex)" class="cursor-pointer text-negative" name="delete_outline" size="xs" />
                </template>
              </iot-table-simple>
              <div class="q-pt-xs">
                <span @click="addKv" class="text-primary cursor-pointer">添加</span>
              </div>
            </div>
          </q-card-section>
        </q-expansion-item>

        <!-- 运维信息 -->
        <q-expansion-item label="运维信息" :header-class="[$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3']" dense>
          <q-card-section class="card-section">
            <iot-form-date label="安装日期" v-model="forms.installationDate" width="110" />
            <iot-form-date label="保修起始日" v-model="forms.warrantyStartDate" width="110" />
            <iot-form-date label="保修有效期" v-model="forms.warrantyValidity" width="110" />
            <iot-form-item label="使用年限" :value.sync="forms.serviceLife" type="number" width="110" />
            <iot-form-item label="主管部门" :value.sync="forms.competentDepartment" type="text" maxlength="32" width="110" />
            <iot-form-item label="权属单位" :value.sync="forms.ownershipUnit" type="text" maxlength="32" width="110" />
            <iot-form-item label="维养单位" :value.sync="forms.maintenanceUnit" type="text" maxlength="32" width="110" />
            <iot-form-item label="使用部门" :value.sync="forms.useDepartment" type="text" maxlength="32" width="110" />
            <iot-form-item label="责任人" :value.sync="forms.responsible" type="text" maxlength="32" width="110" />
            <iot-form-item label="施工单位" :value.sync="forms.constructionUnit" type="text" maxlength="32" width="110" />
            <iot-form-date label="上次维修日期" v-model="forms.lastRepairDate" width="110" />
            <iot-form-item label="尺寸" :value.sync="forms.size" type="text" maxlength="32" width="110" />
            <iot-form-item label="主要技术参数" :value.sync="forms.mainParameters" type="text" maxlength="32" width="110" />
            <iot-form-item label="出厂编号" :value.sync="forms.factoryNo" type="text" maxlength="32" width="110" />
            <iot-form-date label="出厂日期" v-model="forms.manufactureDate" width="110" />
          </q-card-section>
        </q-expansion-item>

        <!-- 设备业务编码 -->
        <q-expansion-item
          :label="`设备业务编码${forms.sn ? '：' : ''}${forms.sn || ''}`"
          :header-class="[$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3']"
          dense
        >
          <q-card-section class="card-section">
            <template v-for="r in surface.rules">
              <iot-form-item
                v-if="r.type === 1"
                :key="r.id"
                :label="r.label"
                :value.sync="r.value"
                @input="updateSn"
                maxlength="12"
                type="text"
                width="110"
              />
              <iot-form-item
                v-if="r.type === 2"
                :key="r.id"
                :label="r.label"
                :value.sync="r.value"
                :options="getOptions(r)"
                @input="updateSn"
                type="select"
                width="110"
              />
              <iot-form-item
                v-if="r.type === 3"
                :key="r.id"
                :label="r.label"
                :value.sync="r.value"
                @input="updateSn"
                maxlength="4"
                hint="位数不足将自动补零"
                type="text"
                width="110"
              />
            </template>
          </q-card-section>
        </q-expansion-item>

        <!-- 设备分组 -->
        <q-expansion-item label="设备分组" :header-class="[$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3']" dense>
          <q-card-section class="card-section">
            <q-tree
              :nodes="nodes"
              :ticked.sync="ticked"
              label-key="name"
              children-key="deviceGroupList"
              node-key="id"
              tick-strategy="strict"
              accordion
            />
          </q-card-section>
        </q-expansion-item>

        <!-- 设备图片 -->
        <q-expansion-item label="设备图片" :header-class="[$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3']" dense>
          <q-card-section class="card-section">
            <q-uploader
              :factory="factory"
              @uploaded="qrCodeUploaded"
              @removed="qrCodeRemoved"
              label="二维码"
              ref="qrCode"
              accept=".bmp, .jpg, .png"
              class="col"
              max-files="1"
              auto-upload
            >
              <template v-slot:list="scope">
                <div class="layout-uploader__list">
                  <div v-for="file in scope.files" :key="file.name">
                    <img :src="file.__img.src" />
                    <q-icon @click="scope.removeFile(file)" name="delete_outline" size="md" color="negative" />
                  </div>
                </div>
              </template>
            </q-uploader>
            <q-uploader
              :factory="factory"
              @uploaded="equipmentPictureUploaded"
              @removed="equipmentPictureRemoved"
              label="设备图片"
              ref="equipmentPicture"
              accept=".bmp, .jpg, .png"
              class="col q-ml-md"
              max-files="3"
              auto-upload
              multiple
            >
              <template v-slot:list="scope">
                <div class="layout-uploader__list">
                  <div v-for="file in scope.files" :key="file.name">
                    <img :src="file.__img.src" />
                    <q-icon @click="scope.removeFile(file)" name="delete_outline" size="md" color="negative" />
                  </div>
                </div>
              </template>
            </q-uploader>
          </q-card-section>
        </q-expansion-item>
      </q-list>
    </q-form>

    <!-- 添加 -->
    <add-kv-dialog ref="addKvDialog" @confirm="onAddKv" />
  </iot-dialog>
</template>

<script src="./create.js" />
<style src="./create.scss" lang="scss" scoped />
